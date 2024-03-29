import classes from "./Feed.module.css";
import React, { useEffect, useState } from "react";
import AppTitle from "../components/AppTitle";
import API from "../components/Addressables.jsx";
import ScrollDetector from "../components/ScrollDetector.jsx";
import Comments from "../components/Comments.jsx";

const TOKEN = localStorage.getItem("token");

function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tokenFilled, setTokenFilled] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (
      TOKEN !== null &&
      TOKEN !== "" &&
      TOKEN !== "null" &&
      TOKEN !== "undefined" &&
      TOKEN !== undefined &&
      TOKEN !== null
    ) {
      setTokenFilled(true);
    }
  }, []);

  useEffect(() => {
    async function fetchPosts() {
      console.log("fetching posts page: " + page);
      setLoading(true);
      const response = await fetch(`${API}/posts?page=${page}`);
      const data = await response.json();
      setPosts((prevPosts) => [...prevPosts, ...data]);
      setLoading(false);
    }
    fetchPosts();
  }, [page]);

  const handleScrollToBottom = () => {
    console.log("scrolling to bottom");

    setPage((prevPage) => prevPage + 1);
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

  //The actual structure of the posts
  const postsLoadingHandler = () => {
    return posts.map((post, index) => (
      <React.Fragment key={index}>
        <AppTitle title="Y - Feed" />
        <div className={classes.post}>
          <img src={post.image} />
          <h3>{post.author}</h3>
          <p>{post.text}</p>
          <div className={classes.footPostContainer}>
            <div className={classes.timestamp}>
              {dateFormat(post.timestamp)}
            </div>
            <Comments postID={post._id} dateHandler={dateFormat} tokenFilled={tokenFilled}/>
          </div>
        </div>
      </React.Fragment>
    ));
  };

  const loader = () => {
    if (loading) {
      //window.scrollTo(0, document.body.scrollHeight);
      return (
        <>
          <AppTitle title="Y - Loading posts..." />
          <h1>Loading posts...</h1>
          <img src="/Spinner-1s-197px.svg" />
        </>
      );
    } else {
      return <AppTitle title="Y - Feed" />;
    }
  };

  const postNewPost = async (text) => {
    if (text === "" || text === null || text === undefined || text.length < 2) {
      alert("Your post is too short, minimum length is 2 characters.");
      return;
    }

    const response = await fetch(`${API}/posts/new`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: TOKEN,
      },
      body: JSON.stringify({ text }),
    });

    if (response.status === 201) {
      const newPost = await response.json();
      setPosts((prevPosts) => [newPost, ...prevPosts]);
      document.getElementById("contentInput").value = "";
    } else {
      const output = await response.json();
      alert(output.error);
    }
  };

  const handlePostSubmit = (event) => {
    event.preventDefault();
    const text = event.target.elements.text.value;
    postNewPost(text);
  };

  const writePost = () => {
    return (
      <>
        <h4>Write a new post...</h4>
        <form onSubmit={handlePostSubmit}>
          <textarea
            id="contentInput"
            name="text"
            rows={3}
            placeholder={
              tokenFilled
                ? "What's on your mind?"
                : "You need to be logged in to post.\n\nGo to the profile page to log in."
            }
            disabled={!tokenFilled}
          ></textarea>
          <button type="submit" disabled={!tokenFilled}>
            Post
          </button>
        </form>
      </>
    );
  };

  return (
    <>
      <div className={classes.writePostContainer}>{writePost()}</div>

      <div className={classes.container}>{postsLoadingHandler()}</div>

      <div className={classes.loading}>{loader()}</div>

      <ScrollDetector
        onScrollToBottom={handleScrollToBottom}
        isLoading={loading}
      />
    </>
  );
}

export default Feed;
