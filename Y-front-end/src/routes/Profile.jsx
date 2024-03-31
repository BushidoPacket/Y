import classes from "./Profile.module.css";
import AppTitle from "../components/AppTitle";
import Register from "../components/Register";
import Login from "../components/Login";
import { useEffect, useState } from "react";
import DateFormat from "../components/DateFormat";

import API from "../components/Addressables.jsx";

const TOKEN = localStorage.getItem("token");

//Profile page, contains login and register components while not logged in
//Contains user profile information while logged in
function Profile() {
  const [tokenFilled, setTokenFilled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

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
        <h1>Profile</h1>
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
      return <h4>User not found.</h4>;
    }

    return (
      <>
        <AppTitle title="Y - Profile" />
        <div className={classes.profileContainer}>
          <label>Profile picture</label>
          <img
            src={user.profilePicture}
            alt="Profile"
            className={classes.profilePicture}
          />
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
