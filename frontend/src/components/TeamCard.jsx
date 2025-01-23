import PropTypes from 'prop-types';
import '../styles/teamCard.css';

const TeamCard = ({ user, onClick }) => (
  <div className="team-card" onClick={onClick}>
    {/* Profile Picture */}
    <img
      src={user.profilePicture || '/profile-pic.png'} // Use default if no profile picture
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

TeamCard.propTypes = {
  user: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default TeamCard;
