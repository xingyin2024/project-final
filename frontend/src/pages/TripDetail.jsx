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
      <h1>{trip.title}</h1>
      <p>
        <strong>Location:</strong> {trip.location.city}, {trip.location.country}
      </p>
      <p>
        <strong>Start Date:</strong>{" "}
        {new Date(trip.tripDate.startDate).toLocaleString()}
      </p>
      <p>
        <strong>End Date:</strong>{" "}
        {new Date(trip.tripDate.endDate).toLocaleString()}
      </p>
      <p>
        <strong>Total Days:</strong> {trip.calculatedData?.totalDays || "N/A"}
      </p>
      <p>
        <strong>Hotel Breakfast Days:</strong> {trip.hotelBreakfastDays}
      </p>
      <p>
        <strong>Mileage:</strong> {trip.mileageKm} km
      </p>
      <p>
        <strong>Total Amount:</strong> {trip.calculatedData?.totalAmount || "N/A"} SEK
      </p>
      <p>
        <strong>Status:</strong> {trip.status}
      </p>
    </div>
  );
};

export default TripDetail;
