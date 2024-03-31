import React, { useState, useEffect } from "react";
import Posts from "../components/Posts";
import SearchBar from "../components/SearchBar";

//Main component for the search page, handling search parameters and posts
export default function Search() {
  const [params, setParams] = useState({ author: "", text: "" });
  const [key, setKey] = useState(Math.random());

  //Simple useEffect for updating the key of the Posts component, so it re-renders with the new parameters
  useEffect(() => {
    console.log(Math.random());
    setKey(Math.random());
  }, [params]);

  return (
    <>
      <SearchBar setParams={setParams} />
      <Posts key={key} writeSet={false} params={params} />
    </>
  );
}
