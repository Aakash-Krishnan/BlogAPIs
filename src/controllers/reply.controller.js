const Filter = require("bad-words");

const User = require("../models/user.model");
const Blog = require("../models/blog.model");
const Reply = require("../models/reply.model");
const ViewsRepliesCount = require("../models/viewsRepliesCount.model");

const filter = new Filter();

const {
  replyValidatorSchema,
} = require("../../utils/validators/reply.validator");

exports.getAllReplies = async (_, res) => {
  try {
    const replies = await Reply.find({});

    if (!replies) return res.status(404).json({ error: "Replies not found" });

    return res.status(200).json({
      message: "Replies found",
      data: replies,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

exports.handleNewReply = async (req, res) => {
  try {
    const replyValidatorResults = await replyValidatorSchema.safeParseAsync(
      req.body
    );

    if (replyValidatorResults.error)
      return res.status(400).json({ error: replyValidatorResults.error });

    const { userId, repliedTo, body, blogId } = replyValidatorResults.data;

    const query = Blog.where({ _id: blogId, isActive: true });
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
      return res.status(400).json({ error: err.message });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getAllRepliesBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const query = Blog.where({ slug });
    const blog = await query.findOne();

    if (!blog) return res.status(404).json({ error: "Blog not found" });

    const blogReplies = await Reply.find({ blogId: blog._id });

    if (!blogReplies)
      return res.status(404).json({ error: "Replies not found" });

    return res.status(200).json({
      message: "Replies found",
      data: blogReplies,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
