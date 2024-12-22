import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import "../styles/auth.css";

const Login = () => {
  const { login } = useUser();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
      navigate("/dashboard"); // Redirect to the dashboard upon successful login
    } catch (err) {
      setError(err.message); // Set error message if login fails
    }
  };

  return (
    <div className="login-register-container">
      {/* Header */}
      <div className="login-register-header-container">
        <h1 className="login-register-header">Welcome</h1>

        {/* Registration Link */}
        <p className="login-register-text">
          Not a member yet?{" "}
          <Link to="/register" className="text-btn">
            Register here
          </Link>
        </p>
      </div>

      {/* Error Message */}
      {error && <p className="error-message">{error}</p>}

      {/* Login Form */}
      <form className="login-register-form" onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          className="textinput"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          className="textinput mt-4"
          value={formData.password}
          onChange={handleChange}
        />
        <div className="btn-footer">
          <button
            type="submit"
            className="primary-btn"
            disabled={!formData.email || !formData.password}
          >
            Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
