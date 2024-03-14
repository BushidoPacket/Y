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
const Comment = require("./models/Comment");


//Publish a new post into DB
app.post("/posts", async (req, res) => {
  try {
    const { author, text } = req.body;

    const newPost = new Post({
      author,
      text,
    });

    await newPost.save();

    res.status(201).json(newPost);
    console.log("=== New post created.");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "There has been an error while posting a content. Please try again later." });
  }
});

//Fetch all posts from DB with arguments
app.get("/posts", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skipAmount = (page - 1) * limit;
  const order = parseInt(req.query.order) || -1;

  try {
    const posts = await Post.find()
    .sort({ timestamp: order })
    .skip(skipAmount)
    .limit(limit);

    res.status(200).json(posts);
    console.log("=== Posts fetched successfully.");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "There has been an error while fetching the posts. Please try again later." });
  }
});

//Publish a new comment into DB
app.post("/comments", async (req, res) => {
  try {
    const { author, text, postParentID } = req.body;

    const newComment = new Comment({
      author,
      text,
      postParentID,
    });

    await newComment.save();

    res.status(201).json(newComment);
    console.log("=== New comment created.");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "There has been an error while posting a content. Please try again later." });
  }
});

//Fetch all comments from DB with arguments, from a specific post
app.get("/comments", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skipAmount = (page - 1) * limit;
  const order = parseInt(req.query.order) || -1;
  const postID = req.query.postParentID;

  try {
    const comments = await Comment.find({ postParentID: postID })
    .sort({ timestamp: order })
    .skip(skipAmount)
    .limit(limit);

    res.status(200).json(comments);
    console.log("=== Comments from post ID " + postID + " fetched successfully.");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "There has been an error while fetching the comments. Please try again later." });
  }
});


app.listen(3001, () => console.log("=== Server running on port 3001."));
