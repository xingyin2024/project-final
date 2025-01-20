import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import TripFormHeader from '../components/TripFormHeader';
import '../styles/tripForm.css';
import { formatDateTime } from '../utils/formatDateTime';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const TripDetail = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin } = useUser(); // Get user role from context

  const [trip, setTrip] = useState(state?.trip || null);
  const [loading, setLoading] = useState(!state?.trip);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!trip) {
      const fetchTrip = async () => {
        try {
          setLoading(true);
          const accessToken = localStorage.getItem('accessToken');

          const response = await fetch(`${BASE_URL}/trips/${id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: accessToken,
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.message || 'Failed to fetch trip details.'
            );
          }

          const data = await response.json();
          setTrip(data.data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchTrip();
    }
  }, [id, trip]);

  // In TripDetail:
  const handleDelete = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`${BASE_URL}/trips/${id}`, {
        method: 'DELETE',
        headers: { Authorization: accessToken },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete trip.');
      }
      // maybe navigate to dashboard
      navigate('/dashboard', { state: { deleted: true } });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmitTrip = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`${BASE_URL}/trips/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: accessToken,
        },
        body: JSON.stringify({ status: 'awaiting approval' }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to submit trip.');
      }
      // reload or navigate
      navigate(`/trip/${id}`, { state: { updated: true } });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleApprove = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`${BASE_URL}/trips/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: accessToken,
        },
        body: JSON.stringify({ status: 'approved' }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to approve trip.');
      }
      navigate(`/trip/${id}`, { state: { updated: true } });
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading trip details...</p>;
  if (error) return <p className="error-message">Error: {error}</p>;

  const renderActionButtons = () => {
    if (!trip) return null;

    const { status } = trip;

    // For Co-worker
    if (!isAdmin()) {
      if (status === 'not submitted') {
        return (
          <div className="trip-form-actions">
            <div className="trip-form-actions-row">
              <button
                className="secondary-btn"
                onClick={() =>
                  navigate(`/edit-trip/${id}`, {
                    state: { trip }, // Pass trip data to the EditTrip page
                  })
                }
              >
                Edit
              </button>
              <button
                className="secondary-btn"
                onClick={handleDelete} // call handleDelete
              >
                Delete
              </button>
            </div>
            <div className="trip-form-actions-row">
              <button className="primary-btn" onClick={handleSubmitTrip}>
                Submit
              </button>
            </div>
          </div>
        );
      }
      return null; // No buttons for other statuses
    }

    // For Admin
    if (isAdmin()) {
      if (status === 'awaiting approval') {
        return (
          <div className="trip-form-actions">
            <div className="trip-form-actions-row">
              <button
                className="secondary-btn"
                onClick={() =>
                  navigate(`/edit-trip/${id}`, {
                    state: { trip }, // Pass trip data to the EditTrip page
                  })
                }
              >
                Edit
              </button>
              <button
                className="secondary-btn"
                onClick={handleDelete} // call handleDelete
              >
                Delete
              </button>
            </div>
            <div className="trip-form-actions-row">
              <button className="primary-btn" onClick={handleApprove}>
                Approve
              </button>
            </div>
          </div>
        );
      }
      if (status === 'not submitted' || status === 'approved') {
        return (
          <div className="trip-form-actions">
            <div className="trip-form-actions-row">
              <button
                className="secondary-btn"
                onClick={() =>
                  navigate(`/edit-trip/${id}`, {
                    state: { trip }, // Pass trip data to the EditTrip page
                  })
                }
              >
                Edit
              </button>
              <button
                className="secondary-btn"
                onClick={handleDelete} // call handleDelete
              >
                Delete
              </button>
            </div>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="trip-form-container">
      <TripFormHeader
        title="Trip Detail"
        onBack={() => navigate('/dashboard')}
      />

      <div className="trip-form-content">
        <div className="trip-form-row">
          <p className="trip-form-label">Trip Code</p>
          <p className="trip-form-value">{trip.title}</p>
        </div>

        <div className="trip-form-row">
          <p className="trip-form-label">Location</p>
          <p className="trip-form-value">
            {trip.location.city}, {trip.location.country}
          </p>
        </div>

        <div className="trip-form-row">
          <p className="trip-form-label">Trip Start</p>
          <p className="trip-form-value">
            {formatDateTime(trip.tripDate.startDate)}
          </p>
        </div>

        <div className="trip-form-row">
          <p className="trip-form-label">Trip End</p>
          <p className="trip-form-value">
            {formatDateTime(trip.tripDate.endDate)}
          </p>
        </div>

        <div className="trip-form-row">
          <p className="trip-form-label">Total Traktamente Day</p>
          <p className="trip-form-value">
            {trip.calculatedData?.totalDays || 0} days
          </p>
        </div>

        <div className="trip-form-row">
          <p className="trip-form-label">No. of Hotel Breakfast</p>
          <p className="trip-form-value">{trip.hotelBreakfastDays || 0} days</p>
        </div>

        <div className="trip-form-row">
          <p className="trip-form-label">
            Driving Mil with Private Car (1 mil = 10 km)
          </p>
          <p className="trip-form-value">{trip.mileageKm || 0} mil</p>
        </div>

        <hr className="trip-form-divider" />

        <div className="trip-form-row">
          <p className="trip-form-label total-label">Total Amount</p>
          <p className="trip-form-value total-value">
            {trip.calculatedData?.totalAmount || 0} SEK
          </p>
        </div>

        <hr className="trip-form-divider" />

        <div className="trip-form-row">
          <p className="trip-form-label">Status:</p>
          <p
            className={`trip-form-status ${trip.status
              .toLowerCase()
              .replace(' ', '-')}`}
          >
            {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
          </p>
        </div>
      </div>

      {/* Render action buttons based on status and role */}
      {renderActionButtons()}
    </div>
  );
};

export default TripDetail;
