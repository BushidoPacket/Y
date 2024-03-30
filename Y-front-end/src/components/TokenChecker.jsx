import { useEffect } from "react";

//Check if token is filled and set the state
export default function TokenChecker({ setTokenFilled, TOKEN }) {

    useEffect(() => {
        if (
          TOKEN !== null &&
          TOKEN !== "" &&
          TOKEN !== "null" &&
          TOKEN !== "undefined" &&
          TOKEN !== undefined &&
          TOKEN !== null
        ) {
          setTokenFilled(true);
        }
      }, []);

  return null;
}
