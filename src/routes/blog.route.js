const express = require("express");
const controller = require("../controllers/blog.controller");

const { rateLimitMiddleWare } = require("../../utils/rateLimiter");

const router = express.Router();

router.get("/", controller.getAllBlogs);

router.post("/new", rateLimitMiddleWare, controller.handleNewBlog);

router.get("/:slug", controller.getBlogBySlug);

router.patch("/:slug", controller.updateBlogBySlug);

router.delete("/:slug", controller.deleteBlogBySlug);

module.exports = router;
