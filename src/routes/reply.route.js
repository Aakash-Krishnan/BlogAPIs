const express = require("express");
const controller = require("../controllers/reply.controller");

const router = express.Router();

router.get("/", controller.getAllReplies);

router.post("/new", controller.handleNewReply);

router.get("/:slug", controller.getAllRepliesBySlug);

module.exports = router;
