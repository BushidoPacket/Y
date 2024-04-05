import React, { useEffect } from "react";

//Detects when user scrolls to the bottom of the page to load more posts, handled in Feed.jsx
function ScrollDetector({ onScrollToBottom, isLoading }) {
  useEffect(() => {
    let timeoutId = null;

    const handleScroll = () => {
      const offset = 2000;
      /* offset set based on testing */

      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - offset
      ) {
        if (!timeoutId && !isLoading) {
          timeoutId = setTimeout(() => {
            onScrollToBottom();
            timeoutId = null;
          }, 1000);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [onScrollToBottom]);

  return null;
}

export default ScrollDetector;
