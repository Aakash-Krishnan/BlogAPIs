const { z } = require("zod");

const replyValidatorSchema = z.object({
  blogId: z.string(),
  // userId: z.string(),
  repliedTo: z.string().optional(),
  body: z.string(),
});

module.exports = {
  replyValidatorSchema,
};
