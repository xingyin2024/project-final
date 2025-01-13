import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import Loading from "../assets/Loading.json";

import { useUser }  from "../context/UserContext";
import "../styles/auth.css";

const Register = () => {
  const { register, loading, error, setError } = useUser(); // Use the register function from UserContext
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
  });
  const navigate = useNavigate(); // Navigation for successful registration

  // Handle input changes
  const handleChange = (e) => {
    setError(null); // Clear error state
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await register(formData); // Call the register function from UserContext
      navigate("/dashboard"); // Redirect to the dashboard upon success
    } catch (err) {
      console.error("Registration failed:", err);
    }
  };

  return (
    <div className="login-register-container">
      {/* Header */}
      <div className="login-register-header-container">
        <h1 className="login-register-header">Register</h1>
        <p className="login-register-text">
          Already a member?{" "}
          <Link to="/login" className="text-btn">
            Login here
          </Link>
        </p>
      </div>

      {/* Loading Animation */}
      {loading ? (
        <div className="loading-overlay">
          <Lottie animationData={Loading} loop autoplay className="loading-animation" />
        </div>
      ) : (
        // Register Form
        <form className="login-register-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            className="textinput"
            value={formData.username}
            onChange={handleChange}
          />
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            className="textinput"
            value={formData.firstName}
            onChange={handleChange}
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            className="textinput"
            value={formData.lastName}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="textinput"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="textinput"
            value={formData.password}
            onChange={handleChange}
          />
          <div className="btn-footer">
            <button
              type="submit"
              className="primary-btn"
              disabled={
                !formData.username ||
                !formData.firstName ||
                !formData.lastName ||
                !formData.email ||
                !formData.password
              }
            >
              Register
            </button>
          </div>
        </form>
      )}

      {/* Error Message */}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Register;
