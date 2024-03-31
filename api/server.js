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
const User = require("./models/User");

const { hashPassword, compare, createToken, verifyToken } = require("./auth");

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
      profilePicture: "../profile_pictures/default.png",
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
          .json({ message: "User logged in successfully.", token });
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

//Publish a new post into DB
app.post("/posts/new", async (req, res) => {
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

  //Create post
  try {
    const { text } = req.body;

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

//Fetch all posts from DB with arguments
app.get("/posts", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skipAmount = (page - 1) * limit;
  const order = parseInt(req.query.order) || -1;

  let params = {};
  if (req.query.author && req.query.author !== "" && req.query.author !== "null" && req.query.author !== "undefined" && req.query.author !== undefined && req.query.author !== null) {
    params.author = { $regex: new RegExp(req.query.author), $options: 'i' };
  }
  if (req.query.text && req.query.text !== "" && req.query.text !== "null" && req.query.text !== "undefined" && req.query.text !== undefined && req.query.text !== null) {
    params.text = { $regex: new RegExp(req.query.text), $options: 'i' };
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

app.listen(3001, () => console.log("=== Server running on port 3001."));
