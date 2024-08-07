const express = require("express");
const controller = require("../controllers/user.controller");

const router = express.Router();

router.get("/", controller.getAllUsers);

router.post("/sign-up", controller.handleUserSignUp);

router.post("/sign-in", controller.handleUserSignIn);

module.exports = router;
