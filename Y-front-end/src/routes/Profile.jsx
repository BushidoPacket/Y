import classes from "./Profile.module.css";
import AppTitle from "../components/AppTitle";
import Register from "../components/Register";
import Login from "../components/Login";
import { useEffect, useState } from "react";

import API from "../components/Addressables.jsx";

const TOKEN = localStorage.getItem("token");

//Profile page, contains login and register components while not logged in
//Contains user profile information while logged in
function Profile() {
  const [tokenFilled, setTokenFilled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const dateFormat = (timestamp) => {
    const date = new Date(timestamp * 1);
    const formattedDate = date.toLocaleString("cs-CZ", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

    const formattedTime = date.toLocaleString("cs-CZ", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const nbsp = "\u00A0";
    const separator = nbsp + " | " + nbsp;

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (
      formattedDate ===
      today.toLocaleString("cs-CZ", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    ) {
      return `${formattedTime}${separator}Today`;
    } else if (
      formattedDate ===
      yesterday.toLocaleString("cs-CZ", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    ) {
      return `${formattedTime}${separator}Yesterday`;
    } else {
      return `${formattedTime}${separator}${formattedDate}`;
    }
  };

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
    console.log(user);

    if (user === null) {
      return <h4>Loading...</h4>;
    }

    return (
      <>
        <AppTitle title="Y - Profile" />
        <h1>Profile</h1>
        <div className={classes.profileContainer}>
          <label>Username</label>
          <input type="text" name="username" value={user.username} disabled />
          <label>Email</label>
          <input type="email" name="email" value={user.email} disabled />
          <label>Creation date</label>
          <input
            type="text"
            name="creationDate"
            value={dateFormat(user.creationDate)}
            disabled
          />
          <label>Profile picture</label>
          <img
            src={user.profilePicture}
            alt="Profile"
            className={classes.profilePicture}
          />
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
