const slugify = require("slugify");
const Filter = require("bad-words");
const crypto = require("crypto");

const Blog = require("../models/blog.model");
const User = require("../models/user.model");
const Reply = require("../models/reply.model");
const ViewsRepliesCount = require("../models/viewsRepliesCount.model");

const {
  newBlogValidatorSchema,
  blogViewerValidator,
  blogUpdaterValidator,
} = require("../../utils/validators/blog.validators");

const {
  replyValidatorSchema,
} = require("../../utils/validators/reply.validator");

const filter = new Filter();

exports.getAllBlogs = async (_, res) => {
  const blogs = await Blog.find({ isActive: true });
  return res.json({ blogs });
};

exports.handleNewBlog = async (req, res) => {
  const blogValidatorResults = await newBlogValidatorSchema.safeParseAsync(
    req.body
  );

  const user = req.user;

  if (blogValidatorResults.error)
    return res.status(400).json({ error: blogValidatorResults.error });

  const { title, body } = blogValidatorResults.data;

  if (!user) return res.status(400).json({ error: "User not found" });

  if (filter.isProfane(title) || filter.isProfane(body))
    return res.status(400).json({
      error:
        "There are so much words, yet you choose profanity 😒. aura -100000",
    });

  const slug = slugify(title, { lower: true });

  let uniqueSlug = slug;
  let isUnique = false;

  while (!isUnique) {
    const randomString = crypto.randomBytes(3).toString("hex"); // Generate a short random string
    uniqueSlug = `${slug}-${randomString}`;

    // Check if the slug is unique
    const existingBlog = await Blog.findOne({ slug: uniqueSlug });
    if (!existingBlog) {
      isUnique = true;
    }
  }

  try {
    const blog = await Blog.create({
      title,
      body,
      slug: uniqueSlug,
      authorId: user._id,
      views: 0,
      isActive: true,
    });

    return res.status(201).json({
      message: "Blog created successfully",
      data: blog,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Blog already exists" });
    }

    return res.status(500).json({ error: err.message });
  }
};

exports.getBlogBySlug = async (req, res) => {
  const slugParam = req.params.slug;

  const viewer = req.user;

  const blog = await Blog.findOne({ slug: slugParam, isActive: true });

  if (!blog) return res.status(404).json({ error: "Blog not found" });

  const replies = await Reply.find({ blogId: blog._id });

  if (String(blog.authorId) != String(viewer._id)) {
    const blogUserId = `${blog._id}_${viewer._id}`;

    const query = ViewsRepliesCount.where({ blogUserId });
    const viewsRepliesCount = await query.findOne();

    if (!viewsRepliesCount) {
      await ViewsRepliesCount.create({
        blogUserId,
        blogId: blog._id,
        viewerId: viewer._id,
        viewCount: 1,
        replyCount: 0,
      });
      blog.views += 1;
      await blog.save();
    } else if (viewsRepliesCount.viewCount >= 10) {
      return res
        .status(400)
        .json({ error: "You have reached the maximum limit to view a blog" });
    } else {
      blog.views += 1;
      viewsRepliesCount.viewCount += 1;
      await blog.save();
      await viewsRepliesCount.save();
    }
  }

  return res.json({ blog, replies: [...replies] });
};

exports.updateBlogBySlug = async (req, res) => {
  const slugParam = req.params.slug;

  const blogValidatorResults = await blogUpdaterValidator.safeParseAsync(
    req.body
  );

  if (blogValidatorResults.error)
    return res.status(400).json({ error: blogValidatorResults.error });

  const { title, body } = blogValidatorResults.data;

  try {
    const query = Blog.where({ slug: slugParam, isActive: true });
    const blog = await query.findOne();

    if (!blog) return res.status(404).json({ error: "Blog not found" });

    if (title || body) {
      if (title) {
        blog.title = title;

        const newSlug = slugify(title, { lower: true });
        blog.slug = newSlug;
      }

      if (body) {
        blog.body = body;
      }

      await blog.save();
    }

    return res.json({
      message: "Blog updated successfully",
      data: { id: blog._id, title: blog.title },
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

exports.deleteBlogBySlug = async (req, res) => {
  const slugParam = req.params.slug;

  try {
    const query = Blog.where({ slug: slugParam, isActive: true });
    const blog = await query.findOne();

    if (!blog) return res.status(404).json({ error: "Blog not found" });

    blog.isActive = false;
    await blog.save();

    return res.json({
      message: "Blog deleted successfully",
      data: { id: blog._id, title: blog.title },
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
