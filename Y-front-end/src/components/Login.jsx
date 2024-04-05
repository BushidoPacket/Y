import classes from "./Login.module.css";

import API from "./Addressables";

//Handle user login on the page, set inside of Profile.jsx route
function Login() {

    //Login user with username and password
    const loginUser = async (username, password) => {

        const response = await fetch(`${API}/users/login`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        });

        if (response.status !== 200) {
            const user = await response.json();
            alert(user.error);
        }

        if (response.status === 200) {
            const user = await response.json();
            localStorage.setItem("token", user.token);
            localStorage.setItem("username", user.user);
            //alert(user.message);
            window.location.reload();
            //redirect settings
        }
    };

    //Handle login form submission
    const handleLoginSubmit = (event) => {
        event.preventDefault();
        const username = event.target.elements.username.value;
        const password = event.target.elements.password.value;
        loginUser(username, password);
    };



  return (
    <>
      {/* Login form */}
      <div className={classes.loginContainer}>
        <form onSubmit={handleLoginSubmit}>
          <h2>Login</h2>
          <label htmlFor="username">Username:</label>
          <input type="text" id="logUsername" name="username" required />
          <label htmlFor="password">Password:</label>
          <input type="password" id="logPassword" name="password" required />
          <button type="submit">Login</button>
        </form>
      </div>
    </>
  );
}

export default Login;
