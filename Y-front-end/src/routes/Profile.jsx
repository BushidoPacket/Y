import classes from "./Profile.module.css";
import AppTitle from "../components/AppTitle";
import Register from "../components/Register";
import Login from "../components/Login";



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
