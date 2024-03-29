import React from "react";
import { useState, useEffect } from "react";

import classes from "./Comments.module.css";

import API from "./Addressables.jsx";

const TOKEN = localStorage.getItem("token");

function Comments({ postID, dateHandler, tokenFilled }) {
  /*console.log("Datehandler: " + dateHandler(1711114204903));
  console.log("PostID: " + postID);*/

  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [length, setLength] = useState(0);

  useEffect(() => {
    async function fetchComments() {
      console.log("fetching comments"+ postID +" page: " + page);
      setLoading(true);
      const response = await fetch(`${API}/comments?page=${page}&postParentID=${postID}`);
      const data = await response.json();
      setComments((prevComments) => [...prevComments, ...data]);
      setLoading(false);
      setLength(data.length);
    }
    fetchComments();
  }, [page]);

  const commentsLoadingHandler = () => {
    return comments.map((comment, index) => (
      <React.Fragment key={index}>
        <div className={classes.comment}>
          <h4>{comment.author} | <span className={classes.timestamp}>{dateHandler(comment.timestamp)}</span></h4>
          <p className={classes.text}>{comment.text}</p>
        </div>
      </React.Fragment>
    ))
  }

  const handleCommentSubmit = (event) => {
    event.preventDefault();
    const text = event.target.elements.text.value;
    postNewComment(text);
  };

  const postNewComment = async (text) => {
    if (text === "" || text === null || text === undefined || text.length < 2) {
      alert("Your comment is too short, minimum length is 2 characters.");
      return;
    }

    const postParentID = postID;

    const response = await fetch(`${API}/comments/new`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: TOKEN,
      },
      body: JSON.stringify({ text, postParentID }),
    });

    if (response.status === 201) {
      const newComment = await response.json();
      setComments((prevComments) => [newComment, ...prevComments]);
      document.getElementById("commentInput").value = "";
    } else {
      const output = await response.json();
      alert(output.error);
    }
  };

  return (
    <>
    <div className={classes.commentsContainer}>
      <div className={classes.newCommentContainer}>
        <form onSubmit={handleCommentSubmit}> 
          <textarea 
          rows={3} 
          placeholder={
            tokenFilled
              ? "Write a comment..."
              : "You need to be logged in to comment."
          }
          name="text"
          id="commentInput"
          >
          </textarea>
          <button type="submit">
            <img src="icons/chat-bubble.png" />
          </button>
        </form>
      </div>
      <div className={classes.loadedComments}>
        {commentsLoadingHandler()}
        {loading && <p>Loading comments...</p>}
      </div>
      <div className={classes.buttonLoader}>
        <button 
          onClick={() => setPage(page + 1)}
          style={{ display: length < 10 ? "none" : "block" }}
        >
          Load more comments
        </button>
      </div>
    </div>
    </>
  );
}

export default Comments;
