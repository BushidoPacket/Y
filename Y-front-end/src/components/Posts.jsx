import React, { useEffect, useState } from "react";
import AppTitle from "../components/AppTitle";
import ScrollDetector from "../components/ScrollDetector.jsx";
import Comments from "../components/Comments.jsx";
import TokenChecker from "../components/TokenChecker.jsx";
import FetchPosts from "../components/FetchPosts.jsx";
import DateFormat from "../components/DateFormat.jsx";
import PostNewPost from "../components/PostNewPost.jsx";

import classes from "./Posts.module.css";

const TOKEN = localStorage.getItem("token");

//Main component for the feed and search page, loading posts, comments and handling post and comment submission (in sub components)
//writeSet = boolean, if true, it will show the form for writing a new post (made for the purposes of the feed page)
export default function Posts({ writeSet, params }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tokenFilled, setTokenFilled] = useState(false);
  const [page, setPage] = useState(1);

  //Handle scroll to bottom event -> handling pagination with ScrollDetector.jsx component
  const handleScrollToBottom = () => {
    setPage((prevPage) => prevPage + 1);
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
              <DateFormat timestamp={post.timestamp} />
            </div>
            <Comments postID={post._id} tokenFilled={tokenFilled} />
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
      return <AppTitle title="Y - Feed" />;
    }
  };

  //Handle post submission from the form
  const handlePostSubmit = (event) => {
    event.preventDefault();
    const text = event.target.elements.text.value;
    PostNewPost({ text, TOKEN, setPosts });
  };

  //Structure of the form for writing a new post
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
      <TokenChecker setTokenFilled={setTokenFilled} TOKEN={TOKEN} />
      <FetchPosts
        setLoading={setLoading}
        setPosts={setPosts}
        page={page}
        params={params}
      />

      {writeSet && (
        <div className={classes.writePostContainer}>{writePost()}</div>
      )}

      <div className={classes.container}>{postsLoadingHandler()}</div>

      <div className={classes.loading}>{loader()}</div>

      <ScrollDetector
        onScrollToBottom={handleScrollToBottom}
        isLoading={loading}
      />
    </>
  );
}
