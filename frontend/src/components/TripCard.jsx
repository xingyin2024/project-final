import PropTypes from 'prop-types';
import '../styles/tripCard.css';

const TripCard = ({ trip, onClick, userRole }) => {
  const startYear = trip.tripDate?.startDate
    ? new Date(trip.tripDate.startDate).getFullYear()
    : 'Unknown';

  return (
    <div className="trip-card" onClick={onClick}>
      {/* Trip Title and Date */}
      <h3 className="trip-card-title">
        {trip.title} ({startYear})
      </h3>

      {/* Trip Location */}
      <p className="trip-card-location">
        Location: {trip.location?.city || 'Unknown'},{' '}
        {trip.location?.country || 'Unknown'}
      </p>

      {/* Trip Duration */}
      <p className="trip-card-duration">
        Total Traktamente Day: {trip.calculatedData?.totalDays || 0} day(s)
      </p>

      {/* Show Total Amount ONLY if userRole === 'admin' */}
      {userRole === 'admin' && (
        <p className="trip-card-amount">
          Total Amount: {trip.calculatedData?.totalAmount || 0} SEK
        </p>
      )}

      {/* Status */}
      <p
        className={`trip-card-status ${
          trip.status
            ? `status-${trip.status.replace(' ', '-').toLowerCase()}`
            : 'status-default'
        }`}
      >
        Status:{' '}
        {trip.status
          ? trip.status.charAt(0).toUpperCase() + trip.status.slice(1)
          : 'Unknown'}
      </p>
    </div>
  );
};

TripCard.propTypes = {
  trip: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  userRole: PropTypes.string.isRequired, // e.g. 'admin', 'user', etc.
};

export default TripCard;
