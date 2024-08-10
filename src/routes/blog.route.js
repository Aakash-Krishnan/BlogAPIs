const express = require("express");
const controller = require("../controllers/blog.controller");

const { rateLimitMiddleWare } = require("../../utils/rateLimiter");

const {
  verifyAuth,
  restrictToRole,
} = require("../middlewares/auth.middleware");

const {
  parseSlugAndBlog,
} = require("../middlewares/blogSlugParser.middleware");

const router = express.Router();

router.get("/", controller.getAllBlogs);

router.use(verifyAuth);
router.use(restrictToRole());

router.post("/new", rateLimitMiddleWare, controller.handleNewBlog);

router
  .route("/:slug")
  .get(parseSlugAndBlog, controller.getBlogBySlug)
  .patch(parseSlugAndBlog, controller.updateBlogBySlug)
  .delete(controller.deleteBlogBySlug);

module.exports = router;
