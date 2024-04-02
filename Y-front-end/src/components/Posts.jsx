import React, { useState } from "react";
import AppTitle from "../components/AppTitle";
import ScrollDetector from "../components/ScrollDetector.jsx";
import Comments from "../components/Comments.jsx";
import TokenChecker from "../components/TokenChecker.jsx";
import FetchPosts from "../components/FetchPosts.jsx";
import DateFormat from "../components/DateFormat.jsx";
import PostNewPost from "../components/PostNewPost.jsx";
import CheckOwnership from "./CheckOwnership.jsx";
import API from "../components/Addressables.jsx";

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
        <div className={classes.post}>
          <img src={post.image} />
          <h3>{post.author}</h3>
          {post.isEditing ? (
            <textarea
              name="editPost"
              value={post.text}
              onChange={(e) => handleEditChange(e, index)}
            ></textarea>
          ) : (
            <p>{post.text}</p>
          )}
          <div className={classes.footPostContainer}>
            <div className={classes.timestamp}>
              <DateFormat timestamp={post.timestamp} />
            </div>
            {CheckOwnership({ user: post.author }) ? (
              <div className={classes.buttonContainer}>
                {/*EDIT BUTTON*/}
                {post.isEditing ? (
                  <button onClick={() => handleSaveClick(index)}>
                    <img src="icons/write.png" />
                  </button>
                ) : (
                  <button onClick={() => handleEditClick(index)}>
                    <img src="icons/edit.png" />
                  </button>
                )}
                {/*DELETE BUTTON*/}
                <button onClick={() => handleDeleteClick(post._id)}>
                  <img src="icons/bin.png" />
                </button>
              </div>
            ) : null}
            <Comments postID={post._id} tokenFilled={tokenFilled} />
          </div>
        </div>
      </React.Fragment>
    ));
  };

  // Edit Functionality
  const handleEditClick = (index) => {
    const updatedPosts = [...posts];
    updatedPosts[index].isEditing = true;
    setPosts(updatedPosts);
  };

  const handleEditChange = (e, index) => {
    const newPosts = [...posts];
    newPosts[index].text = e.target.value;
    setPosts(newPosts);
  };

  const handleSaveClick = (index) => {
    const updatedPosts = [...posts];
    updatedPosts[index].isEditing = false;
    // Handle saving the edited content
    // You might want to make an API call here to update the post on the server
    setPosts(updatedPosts);
  };

  const handleDeleteClick = async (postId) => {

    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        const response = await fetch(`${API}/posts/delete/${postId}`, {
          method: "DELETE",
          headers: {
            Authorization: TOKEN,
          },
        });
  
        if (response.status === 200) {
          window.location.reload();
        } else {
          alert("An error occured while deleting the post.");
        }
      } catch (error) {
        alert("An error occurred while deleting the post.");
        console.error("An error occurred while deleting the post:", error);
      }
    }

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
          {tokenFilled && <button type="submit">
            Post
          </button>}
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
