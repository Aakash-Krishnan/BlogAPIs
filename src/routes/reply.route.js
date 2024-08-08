const express = require("express");
const controller = require("../controllers/reply.controller");

const { rateLimitMiddleWare } = require("../../utils/rateLimiter");

const router = express.Router();

router.get("/", controller.getAllReplies);

router.post("/new", rateLimitMiddleWare, controller.handleNewReply);

router.get("/:slug", controller.getAllRepliesBySlug);

module.exports = router;
