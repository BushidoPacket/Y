import React, { useEffect, useState } from "react";
import API from "./Addressables.jsx";
import classes from "./Pictures.module.css";

//Component to swap profile pictures between the choices from server
export default function Pictures({ TOKEN, HPEC }) {
  const [pictures, setPictures] = useState([]);
  const [currentPictureIndex, setCurrentPictureIndex] = useState(0);

  //Fetch all available pictures from server
  const fetchPictures = async () => {
    try {
      const response = await fetch(`${API}/profile_pictures`);
      const data = await response.json();
      setPictures(data);
    } catch (error) {
      console.error("Error fetching profile pictures:", error);
    }
  };

  useEffect(() => {
    fetchPictures();
  }, []);

  //Button handlers
  const nextPicture = () => {
    setCurrentPictureIndex((currentPictureIndex + 1) % pictures.length);
  };

  const prevPicture = () => {
    setCurrentPictureIndex(
      (currentPictureIndex - 1 + pictures.length) % pictures.length
    );
  };

  //Request on API to save chosen picture
  const savePicture = async () => {
    const pfpRequest = pictures[currentPictureIndex];

    try {
      const response = await fetch(`${API}/users/edit`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: TOKEN,
        },
        body: JSON.stringify({ profilePicture: pfpRequest }),
      });

      if (response.status === 200) {
        //alert("Profile picture updated successfully.");
        window.location.reload();
      } else {
        alert("An error occurred while updating the profile picture.");
      }
    } catch (error) {
      console.error("Error setting profile picture:", error);
    }
  };

  return (
    <>
      {/* structure for pfp swapping on profile route */}
      <div className={classes.pfpSwitcher}>
        {pictures.length > 0 && (
          <>
            <img
              src={`${API}/profile_pictures/${pictures[currentPictureIndex]}`}
              alt="Profile"
              className={classes.profilePicture}
            />
            <div className={classes.pfpButtonContainer}>
              <button onClick={prevPicture}>◁</button>
              <button onClick={savePicture}>Save</button>
              <button onClick={HPEC}>Exit</button>
              <button onClick={nextPicture}>▷</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
