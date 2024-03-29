import React from "react";
import { useState } from "react";

import classes from "./Comments.module.css";

import API from "./Addressables.jsx";

const TOKEN = localStorage.getItem("token");

function Comments({ postID, dateHandler }) {
  /*console.log("Datehandler: " + dateHandler(1711114204903));
  console.log("PostID: " + postID);*/

  const [comments, setComments] = useState([]);

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

    console.log(comments);
  };

  return (
    <>
    <div className={classes.commentsContainer}>
      <div className={classes.newCommentContainer}>
        <form onSubmit={handleCommentSubmit}> 
          <textarea 
          rows={3} 
          placeholder="Write a comment..." 
          name="text"
          id="commentInput"
          >
          </textarea>
          <button type="submit">
            <img src="icons/chat-bubble.png" />
          </button>
        </form>
      </div>

    </div>
    </>
  );
}

export default Comments;
