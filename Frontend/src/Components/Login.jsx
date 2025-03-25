import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [state, setState] = React.useState({
    email: "",
    password: "",
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

    const { email, password } = state;
    try {
      const response = await axios.post("http://127.0.0.1:5000/login", {
        email,
        password,
      });
      console.log(response);
      if(response.data.message === 'fill_all_fields') {
        alert("Please Fill All Fields");
      }
      else if(response.data.message === 'user_not_found') {
        alert("Wrong Email and Password");
        setState({
            email:"",
            password:"",
        })
      }
      else if(response.data.message === 'wrong_password') {
        alert("Please Enter Correct Password");
        setState({
            email:email,
            password:"",
        })
      }
      else if(response.data.message === 'success') {
        localStorage.setItem("isAuthenticated", "true");  // Save login state
        setIsAuthenticated(true);
        alert(`Welcome to Spam Detection!`);
        navigate("/home");
          setState({
            email: "",
            password: "",
          });
      }
      
    } catch (err) {
      console.error("error: ", err);
    }

  };

  return (
    <div className="form-container sign-in-container">
      <form onSubmit={handleOnSubmit}>
        <h1>Sign in</h1>
        <input
          type="email"
          placeholder="Email"
          name="email"
          value={state.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={state.password}
          onChange={handleChange}
        />
        {/* <a href="#">Forgot your password?</a> */}
        <button>Sign In</button>
      </form>
    </div>
  );
}

export default Login;
