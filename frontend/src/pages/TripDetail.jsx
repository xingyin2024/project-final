import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { IoArrowBackSharp } from "react-icons/io5";
import "../styles/tripDetail.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const TripDetail = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

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

  if (loading) return <p>Loading trip details...</p>;
  if (error) return <p className="error-message">Error: {error}</p>;

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
          <p className="trip-detail-value">{trip.calculatedData?.totalDays || "N/A"} days</p>
        </div>

        <div className="trip-detail-row">
          <p className="trip-detail-label">No. of Hotel Breakfast</p>
          <p className="trip-detail-value">{trip.hotelBreakfastDays || 0} days</p>
        </div>

        <div className="trip-detail-row">
          <p className="trip-detail-label">Driving Mileage with Private Car</p>
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

      <div className="trip-detail-actions">
        <div className="trip-detail-actions-row">
          <button className="secondary-btn" onClick={() => navigate(`/edit-trip/${id}`)}>
            Edit
          </button>
          <button className="secondary-btn" onClick={() => console.log("Delete trip", id)}>
            Delete
          </button>
        </div>
        <div className="trip-detail-actions-row">
          <button className="primary-btn" onClick={() => console.log("Submit trip", id)}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripDetail;
