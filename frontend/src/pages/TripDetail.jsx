import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { IoArrowBackSharp } from "react-icons/io5";
import { useUser } from "../context/UserContext"; // Access user context
import "../styles/tripDetail.css";

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
          const accessToken = localStorage.getItem("accessToken");

          const response = await fetch(`${BASE_URL}/trips/${id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: accessToken,
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch trip details.");
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

  const handleApprove = () => {
    console.log("Approve trip:", trip._id);
    // Add API call to approve the trip here
  };

  if (loading) return <p>Loading trip details...</p>;
  if (error) return <p className="error-message">Error: {error}</p>;

  const renderActionButtons = () => {
  if (!trip) return null;

  const { status } = trip;

  // For Co-worker
  if (!isAdmin()) {
    if (status === "not submitted") {
      return (
        <div className="trip-detail-actions">
          <div className="trip-detail-actions-row">
            <button
              className="secondary-btn"
              onClick={() =>
                navigate(`/edit-trip/${trip._id}`, {
                  state: { trip }, // Pass trip data to the EditTrip page
                })
              }
            >
              Edit
            </button>
            <button
              className="secondary-btn"
              onClick={() =>
                navigate(`/edit-trip/${trip._id}`, {
                  state: { trip }, // Pass trip data to the EditTrip page
                })
              }
            >
              Delete
            </button>
          </div>
          <div className="trip-detail-actions-row">
            <button
              className="primary-btn"
              onClick={() => console.log("Submit trip", id)}
            >
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
    if (status === "awaiting approval") {
      return (
        <div className="trip-detail-actions">
          <div className="trip-detail-actions-row">
            <button
              className="secondary-btn"
              onClick={() =>
                navigate(`/edit-trip/${trip._id}`, {
                  state: { trip }, // Pass trip data to the EditTrip page
                })
              }
            >
              Edit
            </button>
            <button
              className="secondary-btn"
              onClick={() => console.log("Delete trip", id)}
            >
              Delete
            </button>
          </div>
          <div className="trip-detail-actions-row">
            <button
              className="primary-btn"
              onClick={handleApprove}
            >
              Approve
            </button>
          </div>
        </div>
      );
    }
    if (status === "not submitted" || status === "approved") {
      return (
        <div className="trip-detail-actions">
          <div className="trip-detail-actions-row">
            <button
              className="secondary-btn"
              onClick={() =>
                navigate(`/edit-trip/${trip._id}`, {
                  state: { trip }, // Pass trip data to the EditTrip page
                })
              }
            >
              Edit
            </button>
            <button
              className="secondary-btn"
              onClick={() => console.log("Delete trip", id)}
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
    <div className="trip-detail-container">
      <header className="trip-detail-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <IoArrowBackSharp size={20} />
        </button>
        <h1 className="trip-detail-title">Trip Detail</h1>
      </header>

      <div className="trip-detail-content">
        <div className="trip-detail-row">
          <p className="trip-detail-label">Trip Code</p>
          <p className="trip-detail-value">{trip.title}</p>
        </div>

        <div className="trip-detail-row">
          <p className="trip-detail-label">Location</p>
          <p className="trip-detail-value">
            {trip.location.city}, {trip.location.country}
          </p>
        </div>

        <div className="trip-detail-row">
          <p className="trip-detail-label">Trip Start</p>
          <p className="trip-detail-value">
            {new Date(trip.tripDate.startDate).toLocaleString("en-GB", {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </p>
        </div>

        <div className="trip-detail-row">
          <p className="trip-detail-label">Trip End</p>
          <p className="trip-detail-value">
            {new Date(trip.tripDate.endDate).toLocaleString("en-GB", {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </p>
        </div>

        <div className="trip-detail-row">
          <p className="trip-detail-label">Total Traktamente Day</p>
          <p className="trip-detail-value">{trip.calculatedData?.totalDays || 0} days</p>
        </div>

        <div className="trip-detail-row">
          <p className="trip-detail-label">No. of Hotel Breakfast</p>
          <p className="trip-detail-value">{trip.hotelBreakfastDays || 0} days</p>
        </div>

        <div className="trip-detail-row">
          <p className="trip-detail-label">Driving Mileage with Private Car (10km)</p>
          <p className="trip-detail-value">{trip.mileageKm || 0} mile</p>
        </div>

        <hr className="trip-detail-divider" />

        <div className="trip-detail-row">
          <p className="trip-detail-label total-label">Total Amount</p>
          <p className="trip-detail-value total-value">
            {trip.calculatedData?.totalAmount || 0} SEK
          </p>
        </div>

        <hr className="trip-detail-divider" />

        <div className="trip-detail-row">
          <p className="trip-detail-label">Status:</p>
          <p
            className={`trip-detail-status ${
              trip.status.toLowerCase().replace(" ", "-")
            }`}
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
