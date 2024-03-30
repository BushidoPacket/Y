import classes from "./Profile.module.css";
import AppTitle from "../components/AppTitle";
import Register from "../components/Register";
import Login from "../components/Login";


//Profile page, contains login and register components while not logged in
//Contains user profile information while logged in
function Profile() {
  

  return (
    <>
    <AppTitle title="Y - Profile"/>
    <h1>Profile</h1>
    <div className={classes.logRegContainer}>
      <Login />
      <div className={classes.separator} />
      <Register />
    </div>
    </>
  );
}

export default Profile;
