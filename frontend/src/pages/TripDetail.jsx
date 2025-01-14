import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

const BASE_URL = import.meta.env.VITE_BASE_URL; // For Vite-based projects

const TripDetail = () => {
  const { id } = useParams(); // Extract trip ID from the URL
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState(null); // State for error handling

  useEffect(() => {
    const getTrip = async () => {
      try {
        const response = await fetch(`${BASE_URL}/trips/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            // Include token for authenticated request
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch trip details");
        }

        const data = await response.json();
        setTrip(data.data); // Adjust to match your API response structure
      } catch (err) {
        console.error("Error fetching trip:", err);
        setError(err.message);
      }
    };

    getTrip();
  }, [id]);

  if (error) {
    return <p className="error-message">Error: {error}</p>;
  }

  if (!trip) {
    return <p>Loading...</p>;
  }

  return (
    <div className="trip-detail-container">
      <header>
        <Button onClick={() => window.history.back()}>&larr; Back</Button>
        <h1>Trip Detail</h1>
      </header>

      <div className="trip-detail">
        
        <p>Trip Code</p>
        <p>{ trip.data.title}</p>
      </div>

      <div className="actions">
        <Button type="secondary">Edit</Button>
        <Button type="secondary">Delete</Button>
        <Button type="primary">Submit</Button>
      </div>

    </div>
  );
};

export default TripDetail;


