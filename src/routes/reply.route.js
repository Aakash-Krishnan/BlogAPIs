const express = require("express");
const controller = require("../controllers/reply.controller");

const { restrictToRole } = require("../middlewares/auth.middleware");

const { rateLimitMiddleWare } = require("../../utils/rateLimiter");

const { ADMIN } = require("../../utils/constants");

const router = express.Router();

router.get("/", restrictToRole(ADMIN), controller.getAllReplies);

router.use(restrictToRole());

router.post("/new", rateLimitMiddleWare, controller.handleNewReply);

router.get("/:slug", controller.getAllRepliesBySlug);

module.exports = router;
