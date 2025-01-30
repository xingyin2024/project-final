import PropTypes from 'prop-types';
import '../styles/tripCard.css';

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (isNaN(date)) return 'N/A';
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}`;
};

const TripCard = ({ trip, onClick, userRole }) => {
  const startYear = trip.tripDate?.startDate
    ? new Date(trip.tripDate.startDate).getFullYear()
    : 'Unknown';

  // Format start and end dates
  const formattedStartDate = formatDate(trip.tripDate?.startDate);
  const formattedEndDate = formatDate(trip.tripDate?.endDate);
  const formattedCreateAt = formatDate(trip.creation?.createdAt);

  return (
    <div className="trip-card" onClick={onClick}>
      {/* Trip Title and Date */}
      <h1 className="trip-card-title">
        {trip.title} ({startYear})
      </h1>

      {/* Trip Location */}
      <p className="trip-card-location">
        Location: {trip.location?.city || 'Unknown'},{' '}
        {trip.location?.country || 'Unknown'}
      </p>

      {/* Trip Duration and Dates */}
      <p className="trip-card-duration">
        Total Traktamente Day: {trip.calculatedData?.totalDays || 0} day(s)
        <span>
          {' '}
          (from {formattedStartDate} to {formattedEndDate})
        </span>
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

      {/* Show Total Amount ONLY if userRole === 'admin' */}
      {userRole === 'admin' && (
        <div className="trip-card-create-container">
          <p className="trip-card-created-by">
            Created By: {trip.creation?.createdBy || N / A}
          </p>
          <p className="trip-card-created-at">
            Created At: {formattedCreateAt || N / A}
          </p>
        </div>
      )}
    </div>
  );
};

TripCard.propTypes = {
  trip: PropTypes.shape({
    title: PropTypes.string.isRequired,
    tripDate: PropTypes.shape({
      startDate: PropTypes.string,
      endDate: PropTypes.string,
    }),
    location: PropTypes.shape({
      country: PropTypes.string,
      city: PropTypes.string,
    }),
    calculatedData: PropTypes.shape({
      totalDays: PropTypes.number,
      totalAmount: PropTypes.number,
    }),
    status: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  userRole: PropTypes.string.isRequired, // e.g. 'admin', 'user', etc.
};

export default TripCard;
