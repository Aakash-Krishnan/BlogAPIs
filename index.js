const express = require("express");
const mongoose = require("mongoose");

const usersRouter = require("./src/routes/user.route");
const blogsRouter = require("./src/routes/blog.route");

const app = express();
const port = 8000;
const host = "localhost";

mongoose
  .connect(
    "mongodb+srv://mrskys156:5D2XNNeHyYp8MHA7@practicecluster.wszfg.mongodb.net/users?retryWrites=true&w=majority&appName=PracticeCluster"
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
