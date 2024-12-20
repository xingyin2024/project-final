import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

const TripDetail = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState(null);

  const apiUrl = import.meta.env.BASE_URL || "http://localhost:8080"; // Define API base URL

  useEffect(() => {
    const getTrip = async () => {
      try {
        const response = await fetch(`${apiUrl}/trips/${id}`); // Fetch specific trip by ID
        if (!response.ok) {
          throw new Error("Failed to fetch trip details");
        }
        const tripData = await response.json();
        setTrip(tripData);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching trip details:", err);
      }
    };

    getTrip();
  }, [id, apiUrl]);

  if (error) return <p className="error-message">{error}</p>;

  if (!trip) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{trip.title}</h1>
      <p><strong>Location:</strong> {trip.location.city}, {trip.location.country}</p>
      <p><strong>Start Date:</strong> {new Date(trip.startDate).toLocaleString()}</p>
      <p><strong>End Date:</strong> {new Date(trip.endDate).toLocaleString()}</p>
      <p><strong>Total Days:</strong> {trip.totalDays}</p>
      <p><strong>Hotel Breakfast Days:</strong> {trip.hotelBreakfastDays}</p>
      <p><strong>Mileage:</strong> {trip.mileage} miles</p>
      <p><strong>Total Amount:</strong> {trip.totalAmount} SEK</p>
      <p><strong>Status:</strong> {trip.status}</p>
    </div>
  );
};

export default TripDetail;
