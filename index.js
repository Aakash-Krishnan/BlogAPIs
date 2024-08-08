const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const usersRouter = require("./src/routes/user.route");
const blogsRouter = require("./src/routes/blog.route");

const app = express();
const port = 8000;
const host = "localhost";

const userId = process.env.USER_ID;
const password = process.env.PASSWORD;

mongoose
  .connect(
    `mongodb+srv://${userId}:${password}@practicecluster.wszfg.mongodb.net/users?retryWrites=true&w=majority&appName=PracticeCluster`
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err);
  });

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to Blogging API");
});

// Users signUp and signIn route.
app.use("/users", usersRouter);

// Blogs create, read, update and delete route.
app.use("/blogs", blogsRouter);

app.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
