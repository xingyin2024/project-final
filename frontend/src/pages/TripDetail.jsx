import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import '../styles/tripForm.css';
import TripFormHeader from '../components/TripFormHeader';
import { formatDateTime } from '../utils/formatDateTime';
import useActionButtons from '../hooks/useActionButtons';
import ConfirmationPopup from '../components/ConfirmationPopup';
import Lottie from 'lottie-react';
import Updating from '../assets/Updating.json';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const TripDetail = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin } = useUser(); // Get user role from context

  const [trip, setTrip] = useState(state?.trip || null);
  const [loading, setLoading] = useState(!state?.trip);
  const [error, setError] = useState(null);

  // *** NEW states for action feedback (and confirmation popup) ***
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  // callback to run after user dismisses the confirmation popup:
  const [nextAction, setNextAction] = useState(null);

  // Fetch trip details if not available in state
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setLoading(true);
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          setError('Authorization token is missing. Please log in again.');
          navigate('/login'); // Redirect to login if token is missing
          return;
        }

        const response = await fetch(`${BASE_URL}/trips/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: accessToken,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch trip details.');
        }

        const data = await response.json();
        setTrip(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (!state?.trip) fetchTrip();
  }, [id, state, navigate]);

  // Helpers to show the confirmation popup and run a callback after dismissal
  const showConfirmation = (message, callbackAfterClose) => {
    setFeedbackMessage(message);
    setNextAction(() => callbackAfterClose);
  };

  const handlePopupClose = () => {
    setFeedbackMessage(null);
    if (nextAction) {
      nextAction();
      setNextAction(null);
    }
  };
  // *** DELETE trip ***
  const handleDelete = async () => {
    try {
      setActionLoading(true);

      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`${BASE_URL}/trips/${id}`, {
        method: 'DELETE',
        headers: { Authorization: accessToken },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete trip.');
      }

      setActionLoading(false);

      showConfirmation(
        `Trip "${trip.title}" has been deleted successfully.`,
        () => {
          navigate('/dashboard', { state: { deleted: true } });
        }
      );
    } catch (err) {
      setActionLoading(false);
      setError(err.message);
    }
  };

  // *** SUBMIT trip => update status to 'awaiting approval' ***
  const handleSubmitTrip = async () => {
    try {
      setActionLoading(true);

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

      setActionLoading(false);

      // Option A: locally update the trip status => UI is immediate
      setTrip((prev) => ({ ...prev, status: 'awaiting approval' }));
      showConfirmation(
        `Trip "${trip.title}" has been submitted successfully.`,
        () => {}
      );
      // Option B: re-fetch the trip
      // or navigate to /trip/:id => ...
      // navigate(`/trip/${id}`, { state: { updated: true } });
    } catch (err) {
      setActionLoading(false);
      setError(err.message);
    }
  };

  // *** APPROVE trip => update status to 'approved' ***
  const handleApprove = async () => {
    try {
      setActionLoading(true);

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

      setActionLoading(false);

      // locally update trip status
      setTrip((prev) => ({ ...prev, status: 'approved' }));
      showConfirmation(
        `Trip "${trip.title}" has been approved successfully.`,
        () => {}
      );
    } catch (err) {
      setActionLoading(false);
      setError(err.message);
    }
  };

  const actionButtons = useActionButtons({
    trip,
    isAdmin,
    navigate,
    handleDelete,
    handleSubmitTrip,
    handleApprove,
  });

  if (loading) return <p>Loading trip details...</p>;
  if (error) return <p className="error-message">Error: {error}</p>;

  return (
    <div className="trip-form-container">
      <TripFormHeader
        title="Trip Detail"
        onBack={() => navigate('/dashboard')}
      />

      {/* LOADING ANIMATION */}
      {actionLoading && (
        <div className="loading-overlay">
          <Lottie
            animationData={Updating}
            loop
            autoplay
            className="loading-animation"
          />
        </div>
      )}

      {/* Feedback Confirmation Popup */}
      {feedbackMessage && (
        <ConfirmationPopup
          message={feedbackMessage}
          onClose={handlePopupClose}
        />
      )}

      <div className="trip-form-content">
        {/* Trip Details */}
        {trip && (
          <>
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
              <p className="trip-form-value">
                {trip.hotelBreakfastDays || 0} days
              </p>
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
          </>
        )}
      </div>

      {/* Action Buttons */}
      {actionButtons}
    </div>
  );
};

export default TripDetail;
