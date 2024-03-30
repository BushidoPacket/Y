import { Link } from "react-router-dom";
import { useEffect } from 'react';

import classes from "./NavBar.module.css";

const TOKEN = localStorage.getItem('token');

function NavBar() {

  //Hide log out button if user is not logged in
  useEffect(() => {
    
    if (!TOKEN) {
      document.querySelector('.' + classes.logBtn).style.display = 'none';
    }
  }, []);

  //Handle user logout and hide log out button
  const handleLogout = () => {
    localStorage.removeItem('token');
    document.querySelector('.' + classes.logBtn).style.display = 'none';
    window.location.reload();
  };
  
  return (
    <>
    
      <div className={classes.navcontainer}>
        <nav className={classes.navmain}>
        <img src="/logo.jpg" />
          <Link to="/" className={classes.link}>
            Feed
          </Link>
          <Link to="/profile" className={classes.link}>
            Profile
          </Link>
          <Link to="/search" className={classes.link}>
            Search
          </Link>
        </nav>

        <button className={classes.logBtn} onClick={handleLogout}>Log out</button>
      </div>

      <div className={classes.filler}></div>
    </>
  );
}

export default NavBar;
