const slugify = require("slugify");
const Filter = require("bad-words");

const Blog = require("../models/blog.model");
const User = require("../models/user.model");
const ViewsRepliesCount = require("../models/viewsRepliesCount.model");

const {
  newBlogValidatorSchema,
  blogViewerValidator,
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

  if (blogValidatorResults.error)
    return res.status(400).json({ error: blogValidatorResults.error });

  const { title, body, authorId } = blogValidatorResults.data;

  const user = await User.find({ _id: authorId });

  if (!user) return res.status(400).json({ error: "User not found" });

  if (filter.isProfane(title) || filter.isProfane(body))
    return res.status(400).json({
      error: "There are so much words, yet you choose profanity 😒. Not cool",
    });

  const slug = slugify(title, { lower: true });

  try {
    const blog = await Blog.create({
      title,
      body,
      slug,
      authorId: user._id,
      views: 0,
      isActive: true,
    });

    return res.status(201).json({
      message: "Blog created successfully",
      data: { id: blog._id, title: blog.title },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Blog already exists" });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
};

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

  if (blog.authorId !== viewerId) {
    const blogUserId = `${blog._id}_${viewerId}`;

    const viewsRepliesCount = await ViewsRepliesCount.findOne({ blogUserId });

    if (!viewsRepliesCount) {
      await ViewsRepliesCount.create({
        blogUserId,
        blogId: blog._id,
        viewerId,
        viewCount: 1,
        replyCount: 0,
      });
    } else {
      viewsRepliesCount.viewCount += 1;
      await viewsRepliesCount.save();
    }
  }

  return res.json({ blog });
};

exports.updateBlogBySlug = async (req, res) => {};

exports.deleteBlogBySlug = async (req, res) => {};
