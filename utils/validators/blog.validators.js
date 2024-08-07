const { z } = require("zod");

const newBlogValidatorSchema = z.object({
  title: z.string().min(2),
  body: z.string().min(2),
  authorId: z.string(),
});

const blogViewerValidator = z.object({
  viewerId: z.string(),
});

module.exports = { newBlogValidatorSchema, blogViewerValidator };
