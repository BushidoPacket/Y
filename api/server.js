const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const rateLimit = require('express-rate-limit');

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
const User = require("./models/User");

const {
  hashPassword,
  compare,
  createToken,
  verifyToken,
  validateRequest,
} = require("./auth");
const fs = require("fs");
const path = require("path");

//Just for the purposes to see the date in a readable format in server console
const dateFormat = (timestamp) => {
  return new Date(timestamp * 1).toLocaleString("cs-CZ", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

//#################################################
//### RATE LIMITS AND PROFILE PICTURES SETTINGS ###
//#################################################

//Template for creating rate limiters
function createRateLimiter(minutes, maxRequests, message=""){
  return rateLimit({
    windowMs: minutes * 60 * 1000, // minutes * seconds * milliseconds 
    max: maxRequests,
    message: 'Too many requests from this IP, please try again later...',
    handler: (req, res) => {
      console.log(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({ error: 'Too many requests from this IP, please try again later. ' + message });
    }
  });
}

//Set specific rate limiters with custom limits and messages
const limiterDefault = createRateLimiter(1, 300); //default limiter
const limiterLogin = createRateLimiter(1, 10); //limiter for login requests
const limiterRegister = createRateLimiter(60, 5, "You are trying to register too many accounts in a short period of time."); //limiter for register requests
const limiterNewPost = createRateLimiter(1, 5, "You can create only 5 posts per minute."); //limiter for new posts
const limiterNewComment = createRateLimiter(1, 10, "You can create only 10 comments per minute."); //limiter for new comments

//Rate limiters for specific routes
app.use("/users/login", limiterLogin);
app.use("/users/new", limiterRegister);
app.use("/posts/new", limiterNewPost);
app.use("/comments/new", limiterNewComment);

//Default rate limiter for all not specified routes
app.use(limiterDefault);


//Provide route to profile pictures
app.use("/profile_pictures", express.static("profile_pictures"));

//Fetch all profile pictures from the server
app.get("/profile_pictures", (req, res) => {
  const directoryPath = path.join(__dirname, "profile_pictures");

  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res.status(500).send("Unable to scan directory: " + err);
    }

    res.send(files);
  });
});

//Custom edit for all users in DB, just for maintenance or massive edit purposes
/*app.post("/customedit", async (req, res) => {
  try {
    const result = await User.updateMany({}, { $set: { profilePicture: "default.png" } });
    console.log(result);
  } catch (err) {
    console.log(err);
  }
});*/

//#############
//### USERS ###
//#############

//Register a new user into DB
app.post("/users/new", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ username: username });
    if (existingUser) {
      console.log(
        "=== Somebody tried to register already existing username: " + username
      );
      return res.status(400).json({ error: "Profile already exists." });
    }

    const existingEmail = await User.findOne({ email: email });
    if (existingEmail) {
      console.log(
        "=== Somebody tried to register already existing email: " + email
      );
      return res
        .status(400)
        .json({ error: "This e-mail address is already being used." });
    }

    const { saltValue, passwordValue } = hashPassword(password);

    const newUser = new User({
      username: username,
      email: email,
      password: passwordValue,
      salt: saltValue,
      creationDate: Date.now(),
      profilePicture: "default.png",
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully." });
    console.log("=== New user " + username + " has been registered.");
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error:
        "There has been an error while registering an user. Please try again later.",
    });
  }
});

//Check whether an user is in DB with the right username and password
app.put("/users/login", async (req, res) => {
  const user = req.body.username;
  const password = req.body.password;

  try {
    const userFound = await User.findOne({ username: user });
    if (userFound) {
      const isPasswordMatch = compare(
        password,
        userFound.salt,
        userFound.password
      );

      if (isPasswordMatch) {
        const token = createToken(user, "30d");
        res
          .status(200)
          .json({ message: "User logged in successfully.", token, user });
        console.log(
          "=== User " +
            user +
            " has logged in at " +
            dateFormat(Date.now()) +
            "."
        );
      } else {
        res.status(401).json({ error: "Invalid password." });
        console.log(
          "=== User " +
            user +
            " has tried to log in at " +
            dateFormat(Date.now()) +
            " with invalid password."
        );
      }
    } else {
      res.status(404).json({ error: "User not found." });
      console.log(
        "=== User " +
          user +
          " has tried to log in at " +
          dateFormat(Date.now()) +
          ", but user was not found."
      );
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error:
        "There has been an error while logging in an user " +
        user +
        " . Please try again later.",
    });
  }
});

//Fetch user info from DB
app.put("/users/info", async (req, res) => {
  const token = req.body.token;

  try {
    const decoded = await verifyToken(token);
    //console.log("=== Token verified for user " + decoded.user + " .");
    const userFound = await User.findOne({ username: decoded.user });
    const { username, email, creationDate, profilePicture } = userFound;

    res.status(200).json({
      message: "Token verified.",
      username: username,
      email: email,
      creationDate: creationDate,
      profilePicture: profilePicture,
    });

    console.log(
      "=== User " +
        decoded.user +
        " info fetched at " +
        dateFormat(Date.now()) +
        "."
    );
  } catch (error) {
    console.log("=== Token not verified.");
    res.status(401).json({ error: "Token not verified." });
  }
});

//Get user's profile picture (without authorization, because all pictures are public)
app.get("/users/pfp", async (req, res) => {
  const username = req.query.username;

  try {
    const userFound = await User.findOne({ username: username });
    if (!userFound) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    res.status(200).json({ profilePicture: userFound.profilePicture });
  } catch (error) {
    console.log("=== Error while fetching the profile picture.");
    res
      .status(500)
      .json({ error: "An error occurred while fetching the profile picture." });
  }
});

//Edit user's profile picture
app.put("/users/edit", async (req, res) => {
  const token = req.headers["authorization"];

  const validation = await validateRequest(token);
  if (validation.status !== 200) {
    return res.status(validation.status).json({ error: validation.error });
  }

  const user = validation.additionals.user;
  const pfpRequest = req.body.profilePicture;

  try {
    const storedUser = await User.findOne({ username: user });

    if (!storedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    if (!pfpRequest) {
      return res.status(400).json({ error: "No profile picture provided." });
    }

    storedUser.profilePicture = pfpRequest;
    await storedUser.save();

    res.status(200).json({ message: "Profile picture updated successfully." });

  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the profile picture." });
  }
});

//#############
//### POSTS ###
//#############

//Publish a new post into DB
app.post("/posts/new", async (req, res) => {
  //Authorize user
  const token = req.headers["authorization"];

  const validation = await validateRequest(token);
  if (validation.status !== 200) {
    return res.status(validation.status).json({ error: validation.error });
  }

  const author = validation.additionals.user;

  //Create post
  try {
    const { text } = req.body;

    if(text.length > 500){
      return res.status(400).json({ error: "Your post is longer than 500 characters ("+ text.length +")!" });
    }

    const newPost = new Post({
      author: author,
      text: text,
      timestamp: Date.now(),
    });

    await newPost.save();

    res.status(201).json(newPost);
    console.log(
      "=== New post created at " +
        dateFormat(Date.now()) +
        " from " +
        author +
        "."
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error:
        "There has been an error while posting a content. Please try again later.",
    });
  }
});

//Delete a post from DB and all associated comments
app.delete("/posts/delete/:id", async (req, res) => {
  const postId = req.params.id;
  //Authorize user
  const token = req.headers["authorization"];

  const validation = await validateRequest(token);
  if (validation.status !== 200) {
    return res.status(validation.status).json({ error: validation.message });
  }

  const author = validation.additionals.user;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    // Check if the user is the author of the post
    if (post.author.toString() !== author) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this post." });
    }

    // Delete the post
    await Post.findByIdAndDelete(postId);

    // Delete all comments associated with the post
    await Comment.deleteMany({ postParentID: postId });

    res
      .status(200)
      .json({ message: "Post and associated comments deleted successfully." });
    console.log("=== Post and associated comments deleted successfully.");
  } catch (error) {
    console.log("=== Error while deleting the post and associated comments.");
    //console.error(error);
    res
      .status(500)
      .json({
        error:
          "An error occurred while deleting the post and associated comments.",
      });
  }
});

//Edit an existing post in DB
app.put("/posts/edit/:id", async (req, res) => {
  const postId = req.params.id;
  let newText = req.body.text;

  //Authorize user
  const token = req.headers["authorization"];

  const validation = await validateRequest(token);
  if (validation.status !== 200) {
    return res.status(validation.status).json({ error: validation.error });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    // Check if the user is the author of the post
    //console.log(decodedToken);
    if (post.author.toString() !== validation.additionals.user) {
      return res
        .status(403)
        .json({ error: "You can only edit your own posts." });
    }

    // Update the post

    post.text = newText;
    post.editStamp = Date.now();
    await post.save();

    res.status(200).json({ message: "Post updated successfully." });
    console.log("=== Post " + post._id + " updated successfully.");
  } catch (error) {
    //console.error(error);
    console.log("=== Error while updating the post.");
    res
      .status(500)
      .json({ error: "An error occurred while updating the post." });
  }
});

//Fetch all posts from DB with arguments
app.get("/posts", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skipAmount = (page - 1) * limit;
  const order = parseInt(req.query.order) || -1;

  let params = {};
  if (
    req.query.author &&
    req.query.author !== "" &&
    req.query.author !== "null" &&
    req.query.author !== "undefined" &&
    req.query.author !== undefined &&
    req.query.author !== null
  ) {
    params.author = { $regex: new RegExp(req.query.author), $options: "i" };
  }
  if (
    req.query.text &&
    req.query.text !== "" &&
    req.query.text !== "null" &&
    req.query.text !== "undefined" &&
    req.query.text !== undefined &&
    req.query.text !== null
  ) {
    params.text = { $regex: new RegExp(req.query.text), $options: "i" };
  }

  try {
    const posts = await Post.find(params)
      .sort({ timestamp: order })
      .skip(skipAmount)
      .limit(limit);
    //await new Promise((resolve) => setTimeout(resolve, 2000));
    res.status(200).json(posts);
    console.log(
      "=== Posts fetched, page " + page + " at " + dateFormat(Date.now()) + "."
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error:
        "There has been an error while fetching the posts. Please try again later.",
    });
  }
});

//################
//### COMMENTS ###
//################

//Publish a new comment into DB
app.post("/comments/new", async (req, res) => {
  //Authorize user
  const token = req.headers["authorization"];

  let author = "";

  if (
    !token ||
    token === "" ||
    token === "null" ||
    token === "undefined" ||
    token === undefined ||
    token === null
  ) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  try {
    const decoded = await verifyToken(token);
    author = decoded.user;
  } catch (error) {
    res.status(401).json({ error: "Invalid token." });
  }

  try {
    const { text, postParentID } = req.body;

    if(text.length > 280){
      return res.status(400).json({ error: "Your comment is longer than 280 characters ("+ text.length +")!" });
    }

    const newComment = new Comment({
      author,
      text,
      postParentID,
      timestamp: Date.now(),
    });

    await newComment.save();

    res.status(201).json(newComment);
    console.log("=== New comment created.");
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error:
        "There has been an error while posting a content. Please try again later.",
    });
  }
});

//Fetch all comments from DB with arguments, from a specific post
app.get("/comments", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skipAmount = (page - 1) * limit;
  const order = parseInt(req.query.order) || -1;
  const postID = req.query.postParentID;

  try {
    const comments = await Comment.find({ postParentID: postID })
      .sort({ timestamp: order })
      .skip(skipAmount)
      .limit(limit);
    //await new Promise((resolve) => setTimeout(resolve, 2000));
    res.status(200).json(comments);
    /*console.log(
      "=== Comments from post ID " + postID + " fetched successfully."
    );*/
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error:
        "There has been an error while fetching the comments. Please try again later.",
    });
  }
});

//Delete a comment from DB
app.delete("/comments/delete/:id", async (req, res) => {
  const commentId = req.params.id;
  //Authorize user
  const token = req.headers["authorization"];

  const validation = await validateRequest(token);
  if (validation.status !== 200) {
    res.status(validation.status).json({ error: validation.error });
    return;
  }

  const author = validation.additionals.user;

  try {
    const comment = await Comment.findOne({ _id: commentId, author: author });
    if (!comment) {
      res.status(404).json({ error: "Comment not found." });
      return;
    }

    await Comment.deleteOne({ _id: commentId });
    res.status(200).json({ message: "Comment deleted successfully." });
    console.log("=== Comment " + comment._id + " deleted successfully.");
  } catch (error) {
    //console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the comment." });
  }
});

//Edit an existing comment in DB
app.put("/comments/edit/:id", async (req, res) => {
  const commentId = req.params.id;
  let newText = req.body.text;

  //Authorize user
  const token = req.headers["authorization"];

  const validation = await validateRequest(token);
  if (validation.status !== 200) {
    res.status(validation.status).json({ error: validation.error });
    return;
  }

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).json({ error: "Comment not found" });
      return;
    }

    if (comment.author !== validation.additionals.user) {
      res.status(403).json({ error: "You are not the author of this comment" });
      return;
    }

    comment.text = newText;
    comment.editStamp = Date.now();
    await comment.save();

    res.status(200).json({ message: "Comment updated successfully" });
    console.log("=== Comment " + comment._id + " updated successfully.");
  } catch (error) {
    //console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while updating the comment" });
  }
});

app.listen(3001, () => console.log("=== Server running on port 3001."));
