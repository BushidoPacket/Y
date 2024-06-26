import React from "react";
import { useState, useEffect } from "react";
import DateFormat from "./DateFormat.jsx";
import CheckOwnership from "./CheckOwnership.jsx";
import GetUserPfp from "./GetUserPfp.jsx";
import HandleCharCount from "./HandleCharCount.jsx";

import classes from "./Comments.module.css";

import API from "./Addressables.jsx";

const TOKEN = localStorage.getItem("token");

function Comments({ postID, tokenFilled }) {
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [length, setLength] = useState(0);
  const [charCount, setCharCount] = useState(0);

  //Fetch comments from DB with arguments, from a specific post with pagination
  //Look for "page" and "postID" change in order to update comments and to align with new posts
  useEffect(() => {
    async function fetchComments() {
      setLoading(true);
      let data;
      if (postID) {
        const response = await fetch(
          `${API}/comments?page=${page}&postParentID=${postID}`
        );

        if (response.status !== 200){
          const error = await response.json();
          alert(error.error);
          return null;
        }

        data = await response.json();
      } else {
        data = [];
      }

      if (page > 1) {
        setComments((prevComments) => [...prevComments, ...data]);
      } else {
        setComments(data);
      }

      setLoading(false);
      setLength(data.length);
    }

    fetchComments();
    //console.log("Comments fetched.");
  }, [page, postID]);

  useEffect(() => {
    if (!postID) {
      //setComments(existingComments => [...existingComments, ...postComments[postID]]);
      setComments(existingComments => [...existingComments, null]);
    }
  }, [postID]);

  //Old useEffect for fetching comments
  /*useEffect(() => {
    async function fetchComments() {
      setLoading(true);
      const response = await fetch(
        `${API}/comments?page=${page}&postParentID=${postID}`
      );
      const data = await response.json();
      setComments((prevComments) => [...prevComments, ...data]);
      setLoading(false);
      setLength(data.length);
    }
    fetchComments();
    console.log("Comments fetched.");
  }, [page, postID]);*/

  //Structure for comments to be displayed on .map
  const commentsLoadingHandler = () => {
    return comments.map((comment, index) => (
      <React.Fragment key={index}>
        <div className={classes.comment}>
          <div className={classes.authorInfo}>
            <GetUserPfp user={comment.author} size={"comment"}/>
            <h4>
            {comment.author} |{" "}
            <span className={classes.timestampComment}>
              <DateFormat timestamp={comment.timestamp} />
              {comment.editStamp && (
                <>
                  &nbsp;&nbsp; Edited:{" "}
                  <DateFormat timestamp={comment.editStamp} />
                </>
              )}
            </span>
          </h4>
          </div>
          {comment.isEditing ? (
            <textarea
              name="editComment"
              value={comment.text}
              onChange={(e) => handleEditChange(e, index)}
              className={classes.editCommentTextarea}
            ></textarea>
          ) : (
            <p className={classes.text}>{comment.text}</p>
          )}
          {CheckOwnership({ user: comment.author }) && (
              <div className={classes.buttonContainer}>
                {/*EDIT BUTTON*/}
                {comment.isEditing ? (
                  <><button onClick={() => handleSaveClick(index)}>
                    <img src="icons/write.png" />
                  </button>
                  <button onClick={() => handleEditClick(index)}>
                    <img src="icons/cross.png" />
                  </button>
                  </>
                ) : (
                  <button onClick={() => handleEditClick(index)}>
                    <img src="icons/edit.png" />
                  </button>
                )}
                {/*DELETE BUTTON*/}
                <button onClick={() => handleDeleteClick(comment._id)}>
                  <img src="icons/bin.png" />
                </button>
              </div>
            )}
        </div>
      </React.Fragment>
    ));
  };

  //Handle comment submission
  const handleCommentSubmit = (event) => {
    event.preventDefault();
    const text = event.target.elements.text.value;
    postNewComment(text);
  };

  //Edit Functionality
  const handleEditClick = (index) => {
    const updatedComments = [...comments];
    updatedComments[index].isEditing = !updatedComments[index].isEditing;
    setComments(updatedComments);
  };

  //Handle edit change
  const handleEditChange = (e, index) => {
    const newComments = [...comments];
    newComments[index].text = e.target.value;
    setComments(newComments);
  };

  //Save edited comment
  const handleSaveClick = async (index) => {
    const updatedComments = [...comments];
    updatedComments[index].isEditing = false;

    try {
      const response = await fetch(
        `${API}/comments/edit/${updatedComments[index]._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: TOKEN,
          },
          body: JSON.stringify({ text: updatedComments[index].text }),
        }
      );

      if (response.status === 200) {
        alert("Comment edited successfully.");
      } else {
        alert("An error occurred while editing the comment.");
      }
    } catch (error) {
      alert("An error occurred while editing the comment.");
      console.error("An error occurred while editing the comment:", error);
    }

    setComments(updatedComments);
  };

  //Delete comment with API call
  const handleDeleteClick = async (commentID) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        const response = await fetch(`${API}/comments/delete/${commentID}`, {
          method: "DELETE",
          headers: {
            Authorization: TOKEN,
          },
        });

        if (response.status === 200) {
          window.location.reload();
        } else {
          alert("An error occured while deleting the comment.");
        }
      } catch (error) {
        alert("An error occurred while deleting the comment.");
        console.error("An error occurred while deleting the comment:", error);
      }
    }
  };

  //Post new comment to DB
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
      {/* structure of the comment output */}
      <div className={classes.commentsContainer}>
        <div className={classes.newCommentContainer}>
          {tokenFilled && (
            <div className={classes.inputContainer}>
            <small 
            className={classes.charCount}
            style={{ display: charCount > 0 ? "block" : "none",
            color: charCount == 280 ? "red" : ""}}
            >Characters: {charCount}
            </small>
            <form onSubmit={handleCommentSubmit}>
              <textarea
                rows={3}
                placeholder="Write a comment... (max. 280 characters)"
                name="text"
                id="commentInput"
                onChange={(event) => HandleCharCount(event, setCharCount, 280)}
              ></textarea>
              <button disabled={!tokenFilled} type="submit">
                <img src="icons/chat-bubble.png" />
              </button>
            </form>
            </div>
          )}
        </div>
        <div className={classes.loadedComments}>
          {commentsLoadingHandler()}
          {loading && <p>Loading comments...</p>}
        </div>
        <div className={classes.buttonLoader}>
          <button
            onClick={() => setPage(page + 1)}
            style={{ display: length < 5 ? "none" : "block" }}
          >
            Load more comments
          </button>
        </div>
      </div>
    </>
  );
}

export default Comments;
