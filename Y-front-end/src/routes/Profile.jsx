import classes from "./Profile.module.css";

import { useState } from "react";

function Profile() {
  const [isLogin, setIsLogin] = useState(true);

  const PasswordInput = ({ placeholder }) => {
    const [password, setPassword] = useState("");

    const handleChange = (event) => {
      setPassword(event.target.value);
    };

    return (
      <div className={classes.passwordInput}>
        <input
          type="password"
          placeholder={placeholder}
          value={password}
          onChange={handleChange}
        />
        <input
          type="text"
          placeholder={placeholder}
          value={password}
          onChange={handleChange}
          className={classes.textOverlay}
        />
      </div>
    );
  };

  const LoginPanel = () => {
    return (
      <>
        <h1>Please login or register...</h1>
        <div className={classes.profileContainer}>
          <div className={classes.loginContainer}>
            <h4>Login</h4>
            <div className={classes.itemContainer}>
              <label>Username</label>
              <input type="text" placeholder="Username" />
            </div>
            <div className={classes.itemContainer}>
              <label>Password</label>
              <PasswordInput placeholder="Password" />
            </div>
            <button>Login</button>
          </div>

          <div className={classes.separator} />

          <div className={classes.registerContainer}>
            <h4>Register</h4>
            <div className={classes.itemContainer}>
              <label>Username</label>
              <input type="text" placeholder="Username" />
            </div>
            <div className={classes.itemContainer}>
              <label>E-mail</label>
              <input type="email" placeholder="E-mail" />
            </div>
            <div className={classes.itemContainer}>
              <label>Password</label>
              <PasswordInput placeholder="Password" />
            </div>
            <div className={classes.itemContainer}>
              <label>Repeat password</label>
              <PasswordInput placeholder="Password" />
            </div>
            <button>Register</button>
          </div>
        </div>
      </>
    );
  };

  const SettingsPanel = () => {
    return (
      <>
        <h1>Profile settings</h1>
        <div className={classes.profileContainer}>
          
        </div>
      </>
    );
  };

  return <>{isLogin ? <SettingsPanel /> : <LoginPanel />}</>;
}

export default Profile;
