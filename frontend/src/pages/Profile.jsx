import { useState } from "react";
import { useUser } from "../context/UserContext";
import "../styles/profile.css";

const Profile = () => {
  const { user, setUser } = useUser();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    // Simulate updating user details locally
    setUser({ ...user, ...formData }); // Updates the context with new user details
    setIsEditing(false);
  };

  return (
    <div className="settings-container">
      {/* Header */}
      <h1 className="settings-header">Hello, {user?.firstName || "Guest"}!</h1>

      {/* Profile Section */}
      <div className="profile-section">
        <img
          src="/profile-pic.png" // Replace with dynamic profile image source if available
          alt="Profile"
          className="profile-pic-main"
        />
      </div>

      {/* User Details */}
      <div className="settings-form">
        <div className="form-row">
          <label className="form-label">Firstname</label>
          <input
            type="text"
            name="lastName"
            value={formData.firstName}
            disabled={!isEditing}
            onChange={handleChange}
            className={`textinput ${!isEditing ? "disabled-input" : ""}`}
          />
        </div>
        <div className="form-row">
          <label className="form-label">Lastname</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            disabled={!isEditing}
            onChange={handleChange}
            className={`textinput ${!isEditing ? "disabled-input" : ""}`}
          />
        </div>
        <div className="form-row">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            disabled={!isEditing}
            onChange={handleChange}
            className={`textinput ${!isEditing ? "disabled-input" : ""}`}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="btn-footer">
        {isEditing ? (
          <div className="sm-btn-footer">
            <button onClick={handleSave} className="secondary-btn">
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="secondary-btn"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)} className="primary-btn">
            Update Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;
