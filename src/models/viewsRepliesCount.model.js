const { Schema, model } = require("mongoose");

const viewsRepliesCountSchema = new Schema(
  {
    blogUserId: {
      // Combining blogId and userId to make it unique.

      type: String, // Can I declare Schema.Types.ObjectId here?
      required: true,
      unique: true,
    },
    blogId: {
      type: Schema.Types.ObjectId,
      ref: "blog",
      required: true,
    },
    viewerId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    viewCount: {
      type: Number,
      default: 1,
    },
    replyCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const ViewsRepliesCount = model("viewsRepliesCount", viewsRepliesCountSchema);
module.exports = ViewsRepliesCount;
