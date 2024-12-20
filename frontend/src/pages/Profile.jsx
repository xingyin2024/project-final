import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

const Profile = () => {
  const { user, login } = useContext(AuthContext); // Mock login to update user details
  const [formData, setFormData] = useState({
    firstname: user?.firstname || "",
    secondname: user?.secondname || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    // Simulate updating user details (In real implementation, call backend API here)
    login({ ...user, ...formData });
    setIsEditing(false);
  };

  return (
    <div className="settings-container">
      {/* Header */}
      <h1 className="settings-header">Hello, {user?.firstname || "Guest"}!</h1>

      {/* Profile Section */}
      <div className="profile-section">
        <img
          src="/profile-pic.png" // Replace with dynamic profile image source
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
            name="firstname"
            value={formData.firstname}
            disabled={!isEditing}
            onChange={handleChange}
            className={`textinput ${!isEditing ? "disabled-input" : ""}`}
          />
        </div>
        <div className="form-row">
          <label className="form-label">Secondname</label>
          <input
            type="text"
            name="secondname"
            value={formData.secondname}
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
        <div className="form-row">
          <label className="form-label">Telephone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
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
