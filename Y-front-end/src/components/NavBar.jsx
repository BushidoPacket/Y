import { Link } from "react-router-dom";

import classes from "./NavBar.module.css";

function NavBar() {
  
  return (
    <>
    
      <div className={classes.navcontainer}>
        <nav className={classes.navmain}>
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
      </div>

      <div className={classes.filler}></div>
    </>
  );
}

export default NavBar;
