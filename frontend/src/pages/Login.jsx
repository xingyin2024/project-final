import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { email, password } = formData;
    login(email, password);
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
