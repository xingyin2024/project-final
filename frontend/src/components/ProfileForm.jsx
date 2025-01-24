import PropTypes from 'prop-types';
import '../styles/profileForm.css';

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
          placeholder="Enter username, min 2 characters"
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
          placeholder="Enter your first name"
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
          placeholder="Enter your last name"
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
          placeholder="Enter your email"
          className={`textinput ${!isEditing ? 'disabled-input' : ''}`}
        />
      </div>

      {/* Role (only visible if showRole is true) */}
      {showRole && (
        <div className="form-row">
          <label className="form-label">Role</label>
          <div className="role-options">
            {/* Admin Radio */}
            <label className="radio-label">
              <input
                type="radio"
                name="role"
                value="admin"
                disabled={!isEditing}
                onChange={onChange}
                checked={profileData.role === 'admin'}
              />
              Admin
            </label>

            {/* Co-worker Radio */}
            <label className="radio-label">
              <input
                type="radio"
                name="role"
                value="co-worker"
                disabled={!isEditing}
                onChange={onChange}
                checked={profileData.role === 'co-worker'}
              />
              Co-worker
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

ProfileForm.propTypes = {
  profileData: PropTypes.shape({
    username: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
  }).isRequired,
  isEditing: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  showRole: PropTypes.bool,
  placeholders: PropTypes.object,
};

export default ProfileForm;
