const { z } = require("zod");

const newBlogValidatorSchema = z.object({
  title: z.string().min(2),
  body: z.string().min(2),
  authorId: z.string(),
});

const blogViewerValidator = z.object({
  viewerId: z.string(),
});

const blogUpdaterValidator = z.object({
  title: z.string().min(2).optional(),
  body: z.string().min(2).optional(),
});

module.exports = { newBlogValidatorSchema, blogViewerValidator, blogUpdaterValidator };
