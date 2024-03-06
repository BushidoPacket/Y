const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

mongoose
  .connect("mongodb://localhost:27017/y-social", {
    /*useNewUrlParser: true,
    useUnifiedTopology: true,*/
  })
  .then(() => console.log("=== Connected to DB."))
  .catch(console.error);

const Post = require("./models/Post");

app.get("/feed", async (req, res) => {
  const todos = await Post.find();
  res.json(todos);
});

app.post("/todo/new", (req, res) => {
  const todo = new Todo({
    text: req.body.text,
  });

  todo.save();

  res.json(todo);
});

app.delete("/todo/delete/:id", async (req, res) => {
  const result = await Todo.findByIdAndDelete(req.params.id); //"id" is the name from the route "/todo/delete/:id"
  res.json(result);
});

app.get("/todo/complete/:id", async (req, res) => {
  const todo = await Todo.findById(req.params.id);

  todo.complete = !todo.complete;

  todo.save();

  res.json(todo);
});

app.listen(3001, () => console.log("=== Server running on port 3001."));
