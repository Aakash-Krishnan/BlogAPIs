const Blog = require("../models/blog.model");

exports.parseSlugAndBlog = async (req, res, next) => {
  const slugParam = req.params.slug;
  const slugId = slugParam.split("-").pop();

  let blog = await Blog.findOne({ slug: slugParam, isActive: true });

  if (!blog) {
    blog = await Blog.findOne({ slugId, isActive: true });

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.status(301, { Location: `/blog/${blog.slug}` });
  }

  req.blog = blog;

  next();
};
