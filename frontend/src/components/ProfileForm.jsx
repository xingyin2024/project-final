import PropTypes from 'prop-types';
// import '../styles/profileForm.css';

const ProfileForm = ({ profileData, isEditing, onChange, showRole }) => {
  return (
    <div className="profile-form">
      {/* Username */}
      <div className="form-row">
        <label className="form-label">Username</label>
        <input
          type="text"
          name="username"
          value={profileData.username}
          disabled={!isEditing}
          onChange={onChange}
          className={`textinput ${!isEditing ? 'disabled-input' : ''}`}
        />
      </div>

      {/* Firstname */}
      <div className="form-row">
        <label className="form-label">Firstname</label>
        <input
          type="text"
          name="firstName"
          value={profileData.firstName}
          disabled={!isEditing}
          onChange={onChange}
          className={`textinput ${!isEditing ? 'disabled-input' : ''}`}
        />
      </div>

      {/* Lastname */}
      <div className="form-row">
        <label className="form-label">Lastname</label>
        <input
          type="text"
          name="lastName"
          value={profileData.lastName}
          disabled={!isEditing}
          onChange={onChange}
          className={`textinput ${!isEditing ? 'disabled-input' : ''}`}
        />
      </div>

      {/* Email */}
      <div className="form-row">
        <label className="form-label">Email</label>
        <input
          type="email"
          name="email"
          value={profileData.email}
          disabled={!isEditing}
          onChange={onChange}
          className={`textinput ${!isEditing ? 'disabled-input' : ''}`}
        />
      </div>

      {/* Role (only visible and editable for admin users) */}
      {showRole && (
        <div className="form-row">
          <label className="form-label">Role</label>
          <input
            type="text"
            name="role"
            value={profileData.role}
            disabled={!isEditing} // Editable only if isEditing is true
            onChange={onChange}
            className={`textinput ${!isEditing ? 'disabled-input' : ''}`}
          />
        </div>
      )}
    </div>
  );
};

ProfileForm.propTypes = {
  profileData: PropTypes.object.isRequired,
  isEditing: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  showRole: PropTypes.bool, // Determines whether to show the Role field
};

export default ProfileForm;
