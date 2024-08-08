const slugify = require("slugify");
const Filter = require("bad-words");

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

  if (blogValidatorResults.error)
    return res.status(400).json({ error: blogValidatorResults.error });

  const { title, body, authorId } = blogValidatorResults.data;

  const user = await User.find({ _id: authorId });

  if (!user) return res.status(400).json({ error: "User not found" });

  if (filter.isProfane(title) || filter.isProfane(body))
    return res.status(400).json({
      error:
        "There are so much words, yet you choose profanity 😒. aura -100000",
    });

  const slug = slugify(title, { lower: true });

  try {
    const blog = await Blog.create({
      title,
      body,
      slug,
      authorId,
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

// TODO:
exports.handleNewReply = async (req, res) => {
  try {
    const slugParam = req.params.slug;

    const replyValidatorResults = await replyValidatorSchema.safeParseAsync(
      req.body
    );

    if (replyValidatorResults.error)
      return res.status(400).json({ error: replyValidatorResults.error });

    const { userId, repliedTo, body } = replyValidatorResults.data;

    const query = Blog.where({ slug: slugParam, isActive: true });
    const blog = await query.findOne();
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    const user = await User.findById({ _id: userId });
    if (!user) return res.status(400).json({ error: "User not found" });

    if (repliedTo) {
      const repliedToExists = await Reply.findById({ _id: repliedTo });

      if (!repliedToExists)
        return res.status(400).json({ error: "Reply not found" });
    }

    if (filter.isProfane(body))
      return res.status(400).json({
        error:
          "There are so much words, yet you choose profanity 😒. aura -100000",
      });

    try {
      const reply = await Reply.create({
        blogId: blog._id,
        userId,
        repliedTo,
        body,
      });

      if (String(blog.authorId) != userId) {
        console.log("COUNTING");
        const blogUserId = `${blog._id}_${userId}`;

        const query = ViewsRepliesCount.where({ blogUserId });
        const viewsRepliesCount = await query.findOne();

        if (!viewsRepliesCount) {
          await ViewsRepliesCount.create({
            blogUserId,
            blogId: blog._id,
            viewerId: userId,
            viewCount: 1,
            replyCount: 1,
          });

          blog.views += 1;
          blog.replies += 1;
          await blog.save();
        } else if (
          viewsRepliesCount.viewCount >= 10 ||
          viewsRepliesCount.replyCount >= 10
        ) {
          return res.status(400).json({
            error: "You have reached the maximum limit to view or reply a blog",
          });
        } else {
          blog.replies += 1;
          viewsRepliesCount.replyCount += 1;
          await blog.save();
          await viewsRepliesCount.save();
        }
      }

      return res.status(201).json({
        message: "Reply created successfully",
        data: reply,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// viewerId: is the user's _id who is viewing the blog. Which need to be sent.
exports.getBlogBySlug = async (req, res) => {
  const slugParam = req.params.slug;

  const blogValidatorResults = await blogViewerValidator.safeParseAsync(
    req.body
  );

  if (blogValidatorResults.error)
    return res.status(400).json({ error: blogValidatorResults.error });

  const { viewerId } = blogValidatorResults.data;

  const blog = await Blog.findOne({ slug: slugParam, isActive: true });

  if (!blog) return res.status(404).json({ error: "Blog not found" });

  const replies = await Reply.find({ blogId: blog._id });

  if (String(blog.authorId) != viewerId) {
    console.log("COUNTING");

    const blogUserId = `${blog._id}_${viewerId}`;

    const query = ViewsRepliesCount.where({ blogUserId });
    const viewsRepliesCount = await query.findOne();

    if (!viewsRepliesCount) {
      await ViewsRepliesCount.create({
        blogUserId,
        blogId: blog._id,
        viewerId,
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
