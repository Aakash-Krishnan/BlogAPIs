const { Schema, model } = require("mongoose");

const replySchema = new Schema(
  {
    blogId: {
      type: Schema.Types.ObjectId,
      ref: "blog",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    repliedTo: {
      type: Schema.Types.ObjectId,
      ref: "reply",
      default: null,
    },
    body: {
      type: String,
      required: true,
    },
    // isActive:{
    //     type: Boolean,
    //     default: true
    // }
  },
  { timestamps: true }
);

const Reply = model("reply", replySchema);
module.exports = Reply;
