import classes from "./Profile.module.css";
import AppTitle from "../components/AppTitle";
import Register from "../components/Register";
import Login from "../components/Login";
import { useEffect, useState } from "react";
import DateFormat from "../components/DateFormat";
import Pictures from "../components/Pictures";

import API from "../components/Addressables.jsx";

const TOKEN = localStorage.getItem("token");

//Profile page, contains login and register components while not logged in
//Contains user profile information while logged in
function Profile() {
  const [tokenFilled, setTokenFilled] = useState(false);
  const [user, setUser] = useState(null);
  const [editingPfp, setEditingPfp] = useState(false);

  //Check if token is filled and set the state
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

  //Login and register components + sets title of the document
  //Active when token is not detected
  const loginAndRegister = () => {
    return (
      <>
        <AppTitle title="Y - Log in or register" />
        <div className={classes.logRegContainer}>
          <Login />
          <div className={classes.separator} />
          <Register />
        </div>
      </>
    );
  };

  //Profile information component + sets title of the document
  //Active when token is detected
  const profileInfo = () => {

    if (user === null) {
      return <>
      <img className={classes.loading} src="Spinner-1s-197px.svg"/>
      <h4>Loading informations... If this takes too long, user has not been found.</h4>
      </>
    }

    return (
      <>
        <AppTitle title="Y - Profile" />
        <div className={classes.profileContainer}>
          <label>Profile picture</label>
          {/* if clicked on pfp to edit, it will call pfp swapper, otherwise will show current pfp with button overlay for edit */}
          {editingPfp ? <Pictures TOKEN={TOKEN} HPEC={handlePfpEditClick}/> :
          <div className={classes.imageContainer}>
            <img
              src={`${API}/profile_pictures/${user.profilePicture}`}
              alt="Profile"
              className={classes.profilePicture}   
            />
            <button onClick={() => handlePfpEditClick()} className={classes.imageButton}>Edit picture</button>
          </div>
          }
          <label>Username</label>
          <p className={classes.values}>{user.username}</p>
          <label>Email</label>
          <p className={classes.values}>{user.email}</p>
          <label>Registration date</label>
          <p className={classes.values}><DateFormat timestamp={user.creationDate}/></p>
        </div>
      </>
    );
  };

  //Switching editing state 
  const handlePfpEditClick = () => {
    setEditingPfp(!editingPfp);
  }

  //Fetch user information on load
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfo = await loadUserInfo();
        setUser(userInfo);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, []);

  //API call for user information
  const loadUserInfo = async () => {
    const token = TOKEN;

    const response = await fetch(`${API}/users/info`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    if (response.status !== 200) {
      error = await response.json();
      alert(error.error);
      return null;
      //console.log(user);
    }

    return response.json();
  };

  return <>{tokenFilled ? profileInfo() : loginAndRegister()}</>;
}

export default Profile;
