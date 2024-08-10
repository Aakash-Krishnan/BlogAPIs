require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const usersRouter = require("./src/routes/user.route");
const blogsRouter = require("./src/routes/blog.route");
const repliesRouter = require("./src/routes/reply.route");

const { verifyAuth } = require("./src/middlewares/auth.middleware");

const app = express();
const port = 8000;
const host = "localhost";

const userId = process.env.USER_ID;
const password = process.env.PASSWORD;
const dataBase = process.env.DATA_BASE;

mongoose
  .connect(
    `mongodb+srv://${userId}:${password}@practicecluster.wszfg.mongodb.net/${dataBase}?retryWrites=true&w=majority&appName=PracticeCluster`
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err);
  });

app.use(express.json());

app.get("/", (_, res) => {
  res.send("Welcome to Blogging API");
});

// NOTE: [Users] signUp and signIn route.
app.use("/users", usersRouter);

// NOTE: [Blogs | Replies] create, read, update and delete route.
app.use("/blogs", blogsRouter);

// NOTE: [Replies] create route.
app.use("/replies", verifyAuth, repliesRouter);

app.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
