import PropTypes from 'prop-types';
import { useUser } from '../context/UserContext';
// import { useState, useContext } from 'react';
import '../styles/teamCard.css';

const TeamCard = ({ onClick }) => {
  // Decide which fallback image to use based on role
  const { user, isAdmin } = useUser();
  const imgSrc = isAdmin() ? '/profile-pic-admin.png' : '/profile-pic.png';

  return (
    <div className="team-card" onClick={onClick}>
      {/* Profile Picture */}
      <img
        src={user.profilePicture || imgSrc}
        alt={`${user.firstName} ${user.lastName}`}
        className="team-card-pic"
      />

      {/* User Info */}
      <div className="team-card-info">
        <h3 className="team-card-name">
          {user.firstName} {user.lastName}
        </h3>
        <p className="team-card-role">{user.role}</p>
      </div>
    </div>
  );
};

TeamCard.propTypes = {
  user: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    role: PropTypes.string,
    profilePicture: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default TeamCard;
