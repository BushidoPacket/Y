import classes from "./Register.module.css";

import API from "./Addressables";

function Register() {
    
  const handleRegisterSubmit = (event) => {
    event.preventDefault();
    const username = event.target.elements.username.value;
    const email = event.target.elements.email.value;
    const password = event.target.elements.password.value;
    const passwordCheck = event.target.elements.passwordCheck.value;
    registerUser(username, email, password, passwordCheck);
  };

  const registerUser = async (username, email, password, passwordCheck) => {
    if (!checkInputs(username, email, password, passwordCheck)) {
      return;
    }

    const response = await fetch(`${API}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });

    console.log(response);
    if (response.status !== 201) {
        const user = await response.json();
        alert(user.error);
        //document.getElementById("contentInput").value = "";
    }

    if (response.status === 201) {
        const user = await response.json();
        alert(user.message);
        document.getElementById("regUsername").value = "";
        document.getElementById("regEmail").value = "";
        document.getElementById("regPassword").value = "";
        document.getElementById("regPasswordCheck").value = "";
    }
  };

  const checkInputs = (username, email, password, passwordCheck) => {
    if (password != passwordCheck) {
      alert("Passwords do not match!");
      return false;
    }

    if (username.length < 3) {
      alert("Username must be at least 3 characters long!");
      return false;
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters long!");
      return false;
    }

    if (!email.includes("@")) {
      alert("Invalid email!");
      return false;
    }

    return true;
  };

  return (
    <>
      <div className={classes.registerContainer}>
        <form onSubmit={handleRegisterSubmit}>
          <h2>Register</h2>
          <label htmlFor="username">Username:</label>
          <input type="text" id="regUsername" name="username" required />
          <label htmlFor="email">Email:</label>
          <input type="email" id="regEmail" name="email" required />
          <label htmlFor="password">Password:</label>
          <input type="password" id="regPassword" name="password" required />
          <label htmlFor="password2">Repeat password:</label>
          <input
            type="password"
            id="regPasswordCheck"
            name="passwordCheck"
            required
          />
          <button type="submit">Register</button>
        </form>
      </div>
    </>
  );
}

export default Register;
