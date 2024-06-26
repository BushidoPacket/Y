import React, { useState } from "react";
import classes from "./SearchBar.module.css";

//Search bar component for searching posts by author and text, used in Search route
//If the both values are empty, the search will return all posts like in the Feed route
export default function SearchBar({ setParams }) {
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");

  const handleAuthorChange = (e) => {
    setAuthor(e.target.value);
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleButtonClick = () => {
    setParams({ author, text });
  };

  return (
    <>
      <div className={classes.searchBarContainer}>
        <div className={classes.searchInputs}>
        <input
          onChange={handleAuthorChange}
          type="text"
          name="searchAuthor"
          placeholder="Search by author..."
        />
        <input
          onChange={handleTextChange}
          type="text"
          name="searchText"
          placeholder="Search by text..."
        />
        </div>
        
        <button onClick={handleButtonClick}>Search</button>
      </div>
    </>
  );
}
