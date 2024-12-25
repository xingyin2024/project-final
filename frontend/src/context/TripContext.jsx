import PropTypes from "prop-types";
import { createContext, useContext, useState, useEffect } from "react";

const TripContext = createContext();

const TripProvider = ({ children }) => {
  const [trip, setTrip] = useState([]);
  const [loading, setLoading] = useState(false); // Handles animation for loading
  const [error, setError] = useState(null); // Handles error messages

  // Load Trip from localStorage on initial render
  useEffect(() => {
    const storedTrip = localStorage.getItem("trip");
    if (storedTrip) {
      setTrip(JSON.parse(storedTrip));
    }
  }, []);

  // Centralized function to handle requests with loading and error state
  const handleRequestWithLoading = async (callback) => {
    setLoading(true); // Start loading
    setError(null); // Clear previous errors
    
    try {
      await callback(); // Execute the provided callback
    } catch (err) {
      // Log error and set user-friendly message
      console.error("Error occurred:", err);
      setError(
        err.response?.message || err.message || "An unexpected error occurred."
      );
      throw err; // Rethrow error for calling functions to handle
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const fetchTrip = async () => {
    return handleRequestWithLoading(async () => {
      const response = await fetch(`${BASE_URL}/trip`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch trip.");
      }

      setTrip(data.trip);
      localStorage.setItem("trip", JSON.stringify(data.trip));
    });
  };

  const createTrip = async (formData) => {
    return handleRequestWithLoading(async () => {
      const response = await fetch(`${BASE_URL}/trips`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create trip.");
      }

      setTrip((prevTrip) => [...prevTrip, data.trip]);
      localStorage.setItem("trip", JSON.stringify(trip));
    });
  };

  return (
    <TripContext.Provider value={{ trip, loading, error, fetchTrip, createTrip }}>
      {children}
    </TripContext.Provider>
  );
};   

export const useTrip = () => useContext(TripContext);

export default TripContext;
  
TripProvider.propTypes = {  
  children: PropTypes.node.isRequired,
};