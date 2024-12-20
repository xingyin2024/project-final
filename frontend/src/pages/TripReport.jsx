import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { fetchMockData } from "../utils/fetchMockData";

const TripDetail = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);

  useEffect(() => {
    const getTrip = async () => {
      const trips = await fetchMockData("trips");
      const trip = trips.find((t) => t.id === id);
      setTrip(trip);
    };
    getTrip();
  }, [id]);

  if (!trip) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{trip.title}</h1>
      <p><strong>Location:</strong> {trip.location}</p>
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
