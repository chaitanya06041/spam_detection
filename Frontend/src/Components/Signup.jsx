import axios from "axios";
import React from "react";
import { useNavigate } from "react-router-dom";
function Signup() {
  const navigate = useNavigate();
  const [state, setState] = React.useState({
    email: "",
    password: "",
    app_password: "",
  });
  const handleChange = (evt) => {
    const value = evt.target.value;
    setState({
      ...state,
      [evt.target.name]: value,
    });
  };

  const handleOnSubmit = async (evt) => {
    evt.preventDefault();
    const { email, password, app_password } = state;
    console.log(email, password, app_password);

    try {
      const response = await axios.post("http://127.0.0.1:5000/signup", {
        email,
        password,
        app_password,
      });
      console.log(response);

      if (response.data.error) {
        if (response.data.error === "user_exists") {
          alert("User already exist, please login instead");
          setState({
            email: "",
            password: "",
            app_password:"",
          });
        } else {
          alert("Please Fill All Fields");
        }
        return;
      }

      if (response.data.message) {
        setState({
          email: "",
          password: "",
          app_password:"",
        });
        alert(`Welcome to Spam Detection!`);
        navigate("/home");
      }
    } catch (err) {
      console.error("error: ", err);
    }
  };

  return (
    <div className="form-container sign-up-container">
      <form onSubmit={handleOnSubmit}>
        <h1>Create Account</h1>
        <input
          type="email"
          name="email"
          value={state.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        <input
          type="password"
          name="password"
          value={state.password}
          onChange={handleChange}
          placeholder="Password"
          required
        />
        <input
          type="password"
          name="app_password"
          value={state.name}
          onChange={handleChange}
          placeholder="Google App Password"
          required
        />
        <button>Sign Up</button>
      </form>
    </div>
  );
}

export default Signup;
