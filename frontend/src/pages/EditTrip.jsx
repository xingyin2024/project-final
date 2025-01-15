import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "../styles/editTrip.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const EditTrip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [formData, setFormData] = useState(state?.trip || null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!state?.trip);

  useEffect(() => {
    if (!formData) {
      const fetchTrip = async () => {
        try {
          const accessToken = localStorage.getItem("accessToken");
          const response = await fetch(`${BASE_URL}/trips/${id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: accessToken,
            },
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Failed to fetch trip details.");
          }

          setFormData(data.data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchTrip();
    }
  }, [id, formData]);

  const calculateDaysAndAmount = () => {
    if (!formData.tripDate.startDate || !formData.tripDate.endDate) return;
    const startDate = new Date(formData.tripDate.startDate);
    const endDate = new Date(formData.tripDate.endDate);
    const diffTime = Math.abs(endDate - startDate);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalAmount = totalDays * 500 + formData.hotelBreakfastDays * 100; // Example calculation
    setFormData((prev) => ({
      ...prev,
      calculatedData: { totalDays, totalAmount },
    }));
  };

  useEffect(() => {
    calculateDaysAndAmount();
  }, [formData.tripDate, formData.hotelBreakfastDays]);

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
      const response = await fetch(`${BASE_URL}/trips/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: accessToken,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update trip.");
      }

      // Navigate to Dashboard after successful update
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading trip details...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="edit-trip-container">
      <h1>Edit Trip</h1>
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
        <div className="calculated-values">
          <p>Total Days: {formData.calculatedData?.totalDays || 0}</p>
          <p>Total Amount: {formData.calculatedData?.totalAmount || 0} SEK</p>
        </div>
        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? "Updating..." : "Update Trip"}
        </button>
      </form>
    </div>
  );
};

export default EditTrip;
