import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserContext from "../context/UserContext";
import "../styles/auth.css";

const Login = () => {
  const { login } = useContext(UserContext); // Access login function from context
  const [formData, setFormData] = useState({ emailOrUsername: "", password: "" });
  const [error, setError] = useState(null); // State for error messages
  const navigate = useNavigate(); // Navigation for successful login

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Determine if the input is an email or username
      const isEmail = formData.emailOrUsername.includes("@");
      const credentials = isEmail
        ? { email: formData.emailOrUsername, password: formData.password }
        : { username: formData.emailOrUsername, password: formData.password };

      await login(credentials); // Call the login function from UserContext
      navigate("/dashboard"); // Redirect to the dashboard upon success
    } catch (err) {
      setError(err.message); // Display error message from login function
    }
  };

  return (
    <div className="login-register-container">
      {/* Header */}
      <div className="login-register-header-container">
        <h1 className="login-register-header">Welcome</h1>
        <p className="login-register-text">
          Not a member yet?{" "}
          <Link to="/register" className="text-btn">
            Register here
          </Link>
        </p>
      </div>

      {/* Login Form */}
      <form className="login-register-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="emailOrUsername"
          placeholder="Enter your email or username"
          className="textinput"
          value={formData.emailOrUsername}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          className="textinput"
          value={formData.password}
          onChange={handleChange}
        />
        <div className="btn-footer">
          <button
            type="submit"
            className="primary-btn"
            disabled={!formData.emailOrUsername || !formData.password}
          >
            Login
          </button>
        </div>
      </form>
      
      {/* Error Message */}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Login;
