import classes from "./Feed.module.css";
import React, { useEffect, useState } from "react";

function Feed() {
  const API = "http://localhost:3001";

  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function fetchPosts() {
      const response = await fetch(`${API}/posts`);
      const data = await response.json();
      setPosts(data);
    }
    fetchPosts();
  }, []);

  const dateFormat = (timestamp) => {
    const date = new Date(timestamp * 1);
    const formattedDate = date.toLocaleString("cs-CZ", {
      month: "short",
      day: "2-digit",
      year: "numeric"
    });

    const formattedTime = date.toLocaleString("cs-CZ", {
      hour: "2-digit",
      minute: "2-digit"
    });

    const nbsp = '\u00A0';
    const separator = nbsp + ' | ' + nbsp; 

    return `${formattedTime}${separator}${formattedDate}`;
  }


  //setPosts(prev => ({ ...prev, posts: posts}))

  return (
    <>
      <h1>Feed</h1>
      <div className={classes.container}>
        {posts.map((post, index) => (
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
        ))}
      </div>
    </>
  );
}

export default Feed;
