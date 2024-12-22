import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

const Register = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Registration successful! Redirecting to login.");
    navigate("/login");
  };

  return (
    <div className="login-register-container">
      {/* Header */}
      <div className="login-register-header-container">
        <h1 className="login-register-header">Welcome</h1>

        {/* Login Link */}
        <p className="login-register-text">
          Already a member?{" "}
          <Link to="/login" className="text-btn">
            Login here
          </Link>
        </p>
      </div>
      
      {/* Registration Form */}
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
            Register
            </button>
        </div>
      </form>
    </div>
  );
};

export default Register;
