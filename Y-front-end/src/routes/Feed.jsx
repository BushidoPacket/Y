import React from "react";
import Posts from "../components/Posts";

//Feed route, displays all posts
function Feed() {
  return (
    <>
      <Posts writeSet={true} />
    </>
  );
}

export default Feed;
