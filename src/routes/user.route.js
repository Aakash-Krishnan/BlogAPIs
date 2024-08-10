const express = require("express");
const controller = require("../controllers/user.controller");
const {
  verifyAuth,
  restrictToRole,
} = require("../middlewares/auth.middleware");

const { ADMIN } = require("../../utils/constants");

const router = express.Router();

router.get("/", verifyAuth, restrictToRole(ADMIN), controller.getAllUsers);

router.post("/sign-up", controller.handleUserSignUp);

router.post("/sign-in", controller.handleUserSignIn);

module.exports = router;
