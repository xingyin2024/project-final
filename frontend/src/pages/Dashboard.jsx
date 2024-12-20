import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";

const Dashboard = () => {
  const { user } = useUser();
  const [trips, setTrips] = useState([]);
  const [summary, setSummary] = useState({ submitted: 0, notSubmitted: 0 });

  useEffect(() => {
    const getTrips = async () => {
      try {
        const response = await fetch("/api/trips"); // Replace with actual API endpoint
        const allTrips = await response.json();

        // Filter trips created by the logged-in user
        const userTrips = allTrips.filter((trip) => trip.userId === user?.id);

        // Calculate the number of trips based on status
        const notSubmitted = userTrips.filter(
          (trip) => trip.status === "Not Submitted"
        ).length;
        const submitted = userTrips.filter(
          (trip) => trip.status !== "Not Submitted"
        ).length; // Include Approved and Awaiting Approval

        setSummary({ submitted, notSubmitted });
        setTrips(userTrips);
      } catch (error) {
        console.error("Error fetching trips:", error);
      }
    };

    if (user) {
      getTrips();
    }
  }, [user]);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <h1 className="dashboard-header">Hello! {user?.firstName || "Guest"}</h1>

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
            key={trip.id}
            className="trip-card"
            onClick={() => console.log(`Navigating to trip details for ID: ${trip.id}`)} // Replace with navigation logic
          >
            <h3 className="trip-card-title">
              {trip.title} ({new Date(trip.startDate).getFullYear()})
            </h3>
            <p className="trip-card-location">{trip.location.city}, {trip.location.country}</p>
            <p className="trip-card-amount">Total Amount: ${trip.totalAmount}</p>
            <p className="trip-card-status">Status: {trip.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
