const slugify = require("slugify");
const Filter = require("bad-words");

const Blog = require("../models/blog.model");
const Reply = require("../models/reply.model");
const ViewsRepliesCount = require("../models/viewsRepliesCount.model");

const {
  newBlogValidatorSchema,
  blogUpdaterValidator,
} = require("../../utils/validators/blog.validators");

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

  if (filter.isProfane(title) || filter.isProfane(body))
    return res.status(400).json({
      error:
        "There are so much words, yet you choose profanity 😒. aura -100000",
    });

  const docCount = await Blog.estimatedDocumentCount();
  const slug = `${slugify(title, {
    lower: true,
  })}-${docCount + 1}`;

  try {
    const blog = await Blog.create({
      title,
      body,
      slug,
      slugId: docCount + 1,
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
  const slugId = slugParam.split("-").pop();

  const viewer = req.user;

  let blog = await Blog.findOne({ slug: slugParam, isActive: true });

  if (!blog) {
    blog = await Blog.findOne({ slugId, isActive: true });

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.status(301, { Location: `/blog/${blog.slug}` });
  }

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
  const slugId = slugParam.split("-").pop();

  const blogValidatorResults = await blogUpdaterValidator.safeParseAsync(
    req.body
  );

  if (blogValidatorResults.error)
    return res.status(400).json({ error: blogValidatorResults.error });

  const { title, body } = blogValidatorResults.data;

  try {
    const query = Blog.where({ slug: slugParam, isActive: true });
    let blog = await query.findOne();

    if (!blog) {
      blog = await Blog.find({ slugId });

      if (!blog) {
        return res.status(404).json({ error: "Blog not found" });
      }
    }

    if (title || body) {
      if (title) {
        blog.title = title;

        const newSlug = `${slugify(title, { lower: true })}-${slugId}`;
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
  const slugId = slugParam.split("-").pop();

  try {
    const query = Blog.where({ slug: slugParam, isActive: true });
    let blog = await query.findOne();

    if (!blog) {
      blog = await Blog.findOne({ slugId });

      if (!blog) {
        return res.status(404).json({ error: "Blog not found" });
      }
    }

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
