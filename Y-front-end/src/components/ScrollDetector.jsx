import React, { useEffect } from "react";

function ScrollDetector({ onScrollToBottom, isLoading }) {
  useEffect(() => {
    let timeoutId = null;

    const handleScroll = () => {
      const offset = 2000;

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
