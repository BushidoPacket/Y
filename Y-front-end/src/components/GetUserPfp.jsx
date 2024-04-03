import React, { useState, useEffect } from 'react';
import API from './Addressables.jsx';
import classes from './GetUserPfp.module.css';

export default function GetUserPfp({ user }) {
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const response = await fetch(`${API}/users/pfp?username=${user}`);

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

  return profilePicture ? <img className={classes.profilePicture} src={`${API}/profile_pictures/${profilePicture}`} /> : null;
}
