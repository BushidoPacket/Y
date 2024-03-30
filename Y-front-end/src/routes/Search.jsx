import classes from "./Feed.module.css";
import React, { useEffect, useState } from "react";
import AppTitle from "../components/AppTitle";
import API from "../components/Addressables.jsx";
import ScrollDetector from "../components/ScrollDetector.jsx";
import Comments from "../components/Comments.jsx";

const TOKEN = localStorage.getItem("token");

function Search() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tokenFilled, setTokenFilled] = useState(false);
  const [page, setPage] = useState(1);

  //Check if token is filled and set the state
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

  //Fetch posts from the API with pagination
  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      const response = await fetch(`${API}/posts?page=${page}`);
      const data = await response.json();
      setPosts((prevPosts) => [...prevPosts, ...data]);
      setLoading(false);
    }
    fetchPosts();
  }, [page]);

  //Handle scroll to bottom event -> handling pagination with ScrollDetector.jsx component
  const handleScrollToBottom = () => {
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
        <AppTitle title="Y - Search" />
        <div className={classes.post}>
          <img src={post.image} />
          <h3>{post.author}</h3>
          <p>{post.text}</p>
          <div className={classes.footPostContainer}>
            <div className={classes.timestamp}>
              {dateFormat(post.timestamp)}
            </div>
            <Comments
              postID={post._id}
              dateHandler={dateFormat}
              tokenFilled={tokenFilled}
            />
          </div>
        </div>
      </React.Fragment>
    ));
  };

  //If some posts are loading and front-end is waiting for back-end response, it will show loading text and animation
  const loader = () => {
    if (loading) {
      return (
        <>
          <AppTitle title="Y - Loading posts..." />
          <h1>Loading posts...</h1>
          <img src="/Spinner-1s-197px.svg" />
        </>
      );
    } else {
      return <AppTitle title="Y - Search" />;
    }
  };

  return (
    <>
      <div className={classes.searchContainer}>test</div>

      <div className={classes.container}>{postsLoadingHandler()}</div>

      <div className={classes.loading}>{loader()}</div>

      <ScrollDetector
        onScrollToBottom={handleScrollToBottom}
        isLoading={loading}
      />
    </>
  );
}

export default Search;
