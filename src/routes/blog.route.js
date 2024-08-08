const express = require("express");
const controller = require("../controllers/blog.controller");
const replyController = require("../controllers/reply.controller");

const router = express.Router();

router.get("/", controller.getAllBlogs);

router.post("/new", controller.handleNewBlog);

router.get("/:slug", controller.getBlogBySlug);

router.patch("/:slug", controller.updateBlogBySlug);

router.delete("/:slug", controller.deleteBlogBySlug);

module.exports = router;
