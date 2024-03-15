import classes from "./Feed.module.css";
import React, { useEffect, useState } from "react";

function Feed() {
  const API = "http://localhost:3001";

  const [posts, setPosts] = useState([]);
  const [postLoaded, setPostLoaded] = useState(false);

  useEffect(() => {
    async function fetchPosts() {
      arePostsLoaded(false);
      const response = await fetch(`${API}/posts`);
      const data = await response.json();
      setPosts(data);
      arePostsLoaded(true);
    }
    fetchPosts();
  }, []);

  const arePostsLoaded = (value) => {
    setPostLoaded(value);
  };

  const dateFormat = (timestamp) => {
    const date = new Date(timestamp * 1);
    const formattedDate = date.toLocaleString("cs-CZ", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

    const formattedTime = date.toLocaleString("cs-CZ", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const nbsp = "\u00A0";
    const separator = nbsp + " | " + nbsp;

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (
      formattedDate ===
      today.toLocaleString("cs-CZ", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    ) {
      return `${formattedTime}${separator}Today`;
    } else if (
      formattedDate ===
      yesterday.toLocaleString("cs-CZ", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    ) {
      return `${formattedTime}${separator}Yesterday`;
    } else {
      return `${formattedTime}${separator}${formattedDate}`;
    }
  };

  const postsLoadingHandler = () => {
    if (postLoaded) {
      return posts.map((post, index) => (
        <div key={index} className={classes.post}>
          <img src={post.image} />
          <h3>{post.author}</h3>
          <p>{post.text}</p>
          <div className={classes.footPostContainer}>
            <div className={classes.timestamp}>
              {dateFormat(post.timestamp)}
            </div>
            <div className={classes.buttonContainer}>
              <button>
                <img src="../icons/edit.png" title="edit" />
              </button>
              <button>
                <img src="../icons/bin.png" title="delete" />
              </button>
            </div>
          </div>
        </div>
      ));
    } else {
      return (
        <div>
          <h1>Loading posts...</h1>
        </div>
      );
    }
  };

  const postNewPost = async (author, text) => {
    const response = await fetch(`${API}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ author, text }),
    });

    console.log(response);
    if (response.status === 201) {
      const newPost = await response.json();
      setPosts(prevPosts => [newPost, ...prevPosts]);
      document.getElementById("contentInput").value = "";
    }
  };

  const handlePostSubmit = (event) => {
    event.preventDefault();
    const author = "testovaci autor"; //event.target.elements.author.value;
    const text = event.target.elements.text.value;
    postNewPost(author, text);
  };

  const writePost = () => {
    return (
      <div className={classes.writePostContainer}>
        <h4>Write a new post...</h4>
        <form onSubmit={handlePostSubmit}>
          <input name="author" type="text"></input>
          <textarea id="contentInput" name="text" rows={3} placeholder="What's on your mind?"></textarea>
          <button type="submit">Post</button>
        </form>
      </div>
    );
  };

  //setPosts(prev => ({ ...prev, posts: posts}))

  return (
    <>
      {writePost()}

      <div className={classes.container}>{postsLoadingHandler()}</div>
    </>
  );
}

export default Feed;
