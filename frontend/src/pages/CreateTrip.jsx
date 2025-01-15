import { IoCalendarOutline } from "react-icons/io5";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/createTrip.css"; // Create a specific CSS file for CreateTrip styling

const BASE_URL = import.meta.env.VITE_BASE_URL;

const CreateTrip = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    location: { city: "", country: "" },
    tripDate: { startDate: "", endDate: "" },
    hotelBreakfastDays: 0,
    mileageKm: 0,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes("location.")) {
      const [key, subKey] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [key]: { ...prev[key], [subKey]: value },
      }));
    } else if (name.includes("tripDate.")) {
      const [key, subKey] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [key]: { ...prev[key], [subKey]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(`${BASE_URL}/trips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: accessToken,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create trip.");
      }

      // Navigate to Dashboard after successful creation
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-trip-container">
      <h1>Create a New Trip</h1>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Trip Title:
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          City:
          <input
            type="text"
            name="location.city"
            value={formData.location.city}
            onChange={handleChange}
          />
        </label>
        <label>
          Country:
          <input
            type="text"
            name="location.country"
            value={formData.location.country}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Start Date:
          <input
            type="datetime-local"
            name="tripDate.startDate"
            value={formData.tripDate.startDate}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          End Date:
          <input
            type="datetime-local"
            name="tripDate.endDate"
            value={formData.tripDate.endDate}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Hotel Breakfast Days:
          <input
            type="number"
            name="hotelBreakfastDays"
            value={formData.hotelBreakfastDays}
            onChange={handleChange}
            min="0"
          />
        </label>
        <label>
          Mileage (km):
          <input
            type="number"
            name="mileageKm"
            value={formData.mileageKm}
            onChange={handleChange}
            min="0"
          />
        </label>
        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? "Creating..." : "Create Trip"}
        </button>
      </form>
    </div>
  );
};

export default CreateTrip;
