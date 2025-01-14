import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import "../styles/dashboard.css";

// Retrieve BASE_URL from environment variables
const BASE_URL = import.meta.env.VITE_BASE_URL;

const Dashboard = () => {
  const { user } = useUser(); // Access logged-in user details
  const [trips, setTrips] = useState([]);
  const [summary, setSummary] = useState({ submitted: 0, notSubmitted: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);

        // Retrieve access token
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          throw new Error("Unauthorized: No access token found.");
        }

        // Fetch trips from backend
        const response = await fetch(`${BASE_URL}/trips`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken, // Use direct accessToken here
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch trips.");
        }

        const data = await response.json();

        // Filter trips by logged-in user's `_id`
        const userTrips = data.data.filter(
          (trip) => trip.userId?._id === user?.id
        );

        // Calculate summary
        const notSubmitted = userTrips.filter(
          (trip) => trip.status.toLowerCase() === "not submitted"
        ).length;

        const submitted = userTrips.filter((trip) =>
          ["approved", "awaiting approval"].includes(trip.status.toLowerCase())
        ).length;

        setTrips(userTrips);
        setSummary({ submitted, notSubmitted });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTrips();
    }
  }, [user]);

  if (loading) {
    return <p>Loading trips...</p>;
  }

  if (error) {
    return <p className="error-message">Error: {error}</p>;
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <h1 className="dashboard-header">Hello, {user?.firstName || "Guest"}!</h1>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="sum-card">
          <h2 className="sum-card-title">{summary.notSubmitted}</h2>
          <p className="sum-card-value">trip report(s)</p>
          <p className="sum-card-value">
            <b>Not Submitted</b>
          </p>
        </div>
        <div className="sum-card">
          <h2 className="sum-card-title">{summary.submitted}</h2>
          <p className="sum-card-value">trip report(s)</p>
          <p className="sum-card-value">
            <b>Submitted</b>
          </p>
        </div>
      </div>

      {/* Recent Trips */}
      <div className="recent-trips-header-container">
        <h2 className="recent-trips-header">Recent Trips</h2>
        <button className="text-btn">View All</button>
      </div>
      <ul className="recent-trips-list">
        {trips.map((trip) => (
          <li
            key={trip._id}
            className="trip-card"
            onClick={() => console.log(`Navigating to trip details for ID: ${trip._id}`)} // Replace with navigation logic
          >
            {/* Trip Title and Date */}
            <h3 className="trip-card-title">
              {trip.title} ({new Date(trip.tripDate?.startDate).getFullYear()})
            </h3>

            {/* Trip Location */}
            <p className="trip-card-location">
              Location: {trip.location?.city || "Unknown"}, {trip.location?.country || "Unknown"}
            </p>

            {/* Trip Duration */}
            <p className="trip-card-duration">
              Duration: {trip.calculatedData?.totalDays || "N/A"} day(s)
            </p>

            {/* Total Amount */}
            <p className="trip-card-amount">
              Total Amount: {trip.calculatedData?.totalAmount || 0} SEK
            </p>

            {/* Status */}
            <p
              className={`trip-card-status status-${trip.status
                .replace(" ", "-")
                .toLowerCase()}`}
            >
              Status: {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
            </p>

            {/* Created By */}
            <p className="trip-card-creator">
              Created By: {trip.creation?.createdBy || "Unknown"}
            </p>

            {/* Submission Info */}
            {trip.submission?.approvedBy ? (
              <p className="trip-card-approval">
                Approved By: {trip.submission.approvedBy.firstName}{" "}
                {trip.submission.approvedBy.lastName}
              </p>
            ) : (
              <p className="trip-card-approval">Approval Pending</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
