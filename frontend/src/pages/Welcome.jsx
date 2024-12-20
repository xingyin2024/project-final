import React from "react";
import { NavLink } from "react-router-dom";

const Welcome = () => {
  return (
    <div className="welcome-container">
      {/* Header */}
      <h1 className="welcome-title">Traktamente</h1>

      {/* Secondary Button */}
      <div className="btn-footer">
        <NavLink to="/login" className="secondary-btn">
          Login
        </NavLink>
      </div>
    </div>
  );
};

export default Welcome;
