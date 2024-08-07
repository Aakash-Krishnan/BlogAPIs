const express = require("express");
const controller = require("../controllers/blog.controller");

const router = express.Router();

router.get("/", controller.getAllBlogs);

router.post("/new-blog", controller.handleNewBlog);

router.post("/:slug", controller.getBlogBySlug);

router.put("/:slug", controller.updateBlogBySlug);

router.delete("/:slug", controller.deleteBlogBySlug);

module.exports = router;
