import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { formatDateTime } from '../utils/formatDateTime';
import useActionButtons from '../hooks/useActionButtons';
import TripFormHeader from '../components/TripFormHeader';
import ConfirmationPopup from '../components/ConfirmationPopup';
import Lottie from 'lottie-react';
import Updating from '../assets/Updating.json';
import '../styles/tripForm.css';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const TripDetail = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin } = useUser(); // Get user role from context

  const [trip, setTrip] = useState(state?.trip || null);
  const [loading, setLoading] = useState(!state?.trip);
  const [error, setError] = useState(null);

  // State to manage action loading and messages for the popup
  const [actionLoading, setActionLoading] = useState(false);
  // message to show on the popup
  const [popupMessage, setPopupMessage] = useState(null);
  // callbacks for the popup confirmation buttons (if needed)
  const [popupOnConfirm, setPopupOnConfirm] = useState(null);
  const [popupOnCancel, setPopupOnCancel] = useState(null);

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

  // Generic function to show the popup in confirmation mode
  const showConfirmationPopup = (
    message,
    onConfirmAction,
    onCancelAction = () => {
      // By default, navigate back to TripDetail (no changes)
      navigate(`/trip/${id}`);
    }
  ) => {
    setPopupMessage(message);
    setPopupOnConfirm(() => () => {
      setPopupMessage(null);
      setPopupOnConfirm(null);
      setPopupOnCancel(null);
      onConfirmAction();
    });
    setPopupOnCancel(() => () => {
      setPopupMessage(null);
      setPopupOnConfirm(null);
      setPopupOnCancel(null);
      onCancelAction();
    });
  };

  // Generic function to show an information popup (OK only)
  const showInfoPopup = (message, callbackAfterClose = () => {}) => {
    setPopupMessage(message);
    // Do not set onConfirm and onCancel in info mode.
    setPopupOnConfirm(null);
    setPopupOnCancel(null);
    // Pass the onClose callback using a temporary function.
    setPopupOnConfirm(() => () => {
      setPopupMessage(null);
      setPopupOnConfirm(null);
      callbackAfterClose();
    });
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

      // After successful deletion, show an info popup and navigate afterward.
      showInfoPopup(
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
      showInfoPopup(`Trip "${trip.title}" has been submitted successfully.`);
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
      showInfoPopup(`Trip "${trip.title}" has been approved successfully.`);
    } catch (err) {
      setActionLoading(false);
      setError(err.message);
    }
  };

  // Handler wrappers that first prompt the user for confirmation before executing the real action.
  const handleDeleteWithConfirm = () => {
    showConfirmationPopup(
      `Are you sure to delete this trip "${trip.title}"?`,
      handleDelete,
      () => {
        // if canceled, simply navigate back to the detail page (or leave as is)
        navigate(`/trip/${id}`);
      }
    );
  };

  const handleSubmitWithConfirm = () => {
    showConfirmationPopup(
      `Are you sure to submit this trip "${trip.title}"?`,
      handleSubmitTrip,
      () => {
        navigate(`/trip/${id}`);
      }
    );
  };

  const handleApproveWithConfirm = () => {
    showConfirmationPopup(
      `Are you sure to approve this trip "${trip.title}"?`,
      handleApprove,
      () => {
        navigate(`/trip/${id}`);
      }
    );
  };

  const actionButtons = useActionButtons({
    trip,
    isAdmin,
    navigate,
    handleDelete: handleDeleteWithConfirm,
    handleSubmitTrip: handleSubmitWithConfirm,
    handleApprove: handleApproveWithConfirm,
  });

  if (loading) return <p>Loading trip details...</p>;
  if (error) return <p className="error-message">Error: {error}</p>;

  // Check if user is admin or trip is approved
  const isApproved = trip.status?.toLowerCase() === 'approved';
  const canViewAnyAmount = isAdmin() || isApproved;

  // Derive finalAmount data (and the percentage vs totalAmount)
  const totalAmt = trip?.calculatedData?.totalAmount || 0;
  let finalAmt = trip?.calculatedData?.finalAmount || 0;

  // If totalAmt > 0 but finalAmt == 0 => default finalAmt to totalAmt
  if (totalAmt > 0 && finalAmt === 0) {
    finalAmt = totalAmt;
  }

  // Calculate the percentage note
  let pctNote = '';
  if (totalAmt > 0 && finalAmt > 0) {
    const ratio = (finalAmt / totalAmt) * 100;
    const ratioRounded = Math.round(ratio); // Round to nearest integer
    pctNote = ` (${ratioRounded}% of Total Amount)`;
  }

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

      {/* Confirmation / Info Popup */}
      {popupMessage && (
        <ConfirmationPopup
          message={popupMessage}
          onConfirm={popupOnConfirm}
          onCancel={popupOnCancel}
          onClose={popupOnConfirm} // In info mode, onClose is handled via popupOnConfirm
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

            {/* Everyone sees totalDays in summary */}
            <div className="trip-form-row">
              <p className="trip-form-label">Total Traktamente Day(s)</p>
              <p className="trip-form-value total-value">
                {trip.calculatedData?.totalDays || 0} day(s)
              </p>
            </div>

            {/* Show amounts only if canViewAnyAmount (admin or approved) */}
            {canViewAnyAmount && (
              <>
                <hr className="trip-form-divider" />
                {isAdmin() ? (
                  <>
                    {/* Admin sees raw total and final */}
                    <div className="trip-form-row">
                      <p className="trip-form-label total-label">
                        Total Amount
                      </p>
                      <p className="total-value">{totalAmt} SEK</p>
                    </div>

                    {totalAmt > 0 && (
                      <div className="trip-form-row">
                        <p className="trip-form-label">Final Amount</p>
                        <p className="trip-form-value">
                          {finalAmt} SEK
                          {pctNote && (
                            <span className="trip-form-note">{pctNote}</span>
                          )}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Non-admin but trip is approved => show final only */}
                    {totalAmt > 0 && (
                      <div className="trip-form-row">
                        <p className="trip-form-label">Final Amount</p>
                        <p className="trip-form-value">{finalAmt} SEK</p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            <hr className="trip-form-divider" />
            <div className="trip-form-row">
              <p className="trip-form-label">Status:</p>
              <p
                className={`trip-form-status ${
                  trip.status
                    ? `status-${trip.status.replace(' ', '-').toLowerCase()}`
                    : 'status-default'
                }`}
              >
                {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
              </p>
            </div>

            {isAdmin() && (
              <>
                <div className="trip-form-row">
                  <p className="trip-form-label">Created By</p>
                  <p className="trip-form-value">
                    {trip.creation?.createdBy || 'N/A'}
                  </p>
                </div>

                <div className="trip-form-row">
                  <p className="trip-form-label">Approved By</p>
                  <p className="trip-form-value">
                    {trip.submission?.approvedBy
                      ? `${trip.submission.approvedBy.firstName} ${trip.submission.approvedBy.lastName}`
                      : 'N/A'}
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Action Buttons */}
      {actionButtons}
    </div>
  );
};

export default TripDetail;
