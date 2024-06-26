import React, { useState, useEffect } from 'react';
import API from './Addressables.jsx';
import classes from './GetUserPfp.module.css';

//Fetches the profile picture of a user by username
export default function GetUserPfp({ user, size }) {
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const encodedUsername = encodeURIComponent(user);
        const response = await fetch(`${API}/users/pfp?username=${encodedUsername}`);

        if (response.status !== 200) {
          console.error('Error fetching user pfp');
          return;
        }

        const result = await response.json();
        setProfilePicture(result.profilePicture);
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchProfilePicture();
  }, [user]);

  return profilePicture ? <img className={size === "comment" ? classes.commentPicture : classes.profilePicture} src={`${API}/profile_pictures/${profilePicture}`} /> : null;
}
