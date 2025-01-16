import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { IoArrowBackSharp, IoLocationOutline, IoLocate, IoChevronDownOutline } from "react-icons/io5";
import countries from "../assets/traktamente-en.json";
import favoriteCities from "../assets/fav-city.json";
import "../styles/editTrip.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const EditTrip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [formData, setFormData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState(null);
  const [countryDropdownVisible, setCountryDropdownVisible] = useState(false);
  const [cityDropdownVisible, setCityDropdownVisible] = useState(false);
  const [hotelBreakfastDropdownVisible, setHotelBreakfastDropdownVisible] = useState(false);
  const [mileageDropdownVisible, setMileageDropdownVisible] = useState(false);

  const formatDateForInput = (date) => new Date(date).toISOString().slice(0, 16);

  useEffect(() => {
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

        const formattedTripDate = {
          startDate: formatDateForInput(data.data.tripDate.startDate),
          endDate: formatDateForInput(data.data.tripDate.endDate),
        };

        setFormData({ ...data.data, tripDate: formattedTripDate });
        setOriginalData({ ...data.data, tripDate: formattedTripDate }); // Store original data for comparison
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (state?.trip) {
      const formattedTripDate = {
        startDate: formatDateForInput(state.trip.tripDate.startDate),
        endDate: formatDateForInput(state.trip.tripDate.endDate),
      };
      setFormData({ ...state.trip, tripDate: formattedTripDate });
      setOriginalData({ ...state.trip, tripDate: formattedTripDate });
      setLoading(false);
    } else {
      fetchTrip();
    }
  }, [id, state]);

  const isModified = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "tripDate.startDate") {
      const newStartDate = new Date(value);
      const currentEndDate = new Date(formData.tripDate.endDate);

      if (newStartDate > currentEndDate) {
        const newEndDate = new Date(newStartDate);
        newEndDate.setDate(newStartDate.getDate() + 1);

        setFormData((prev) => ({
          ...prev,
          tripDate: {
            ...prev.tripDate,
            startDate: value,
            endDate: formatDateForInput(newEndDate),
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          tripDate: { ...prev.tripDate, startDate: value },
        }));
      }
    } else if (name === "tripDate.endDate") {
      setFormData((prev) => ({
        ...prev,
        tripDate: { ...prev.tripDate, endDate: value },
      }));
    } else if (name.includes("location.")) {
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
    if (!isModified()) return; // Prevent submission if no changes are made
    setLoading(true);

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

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update trip.");
      }

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
      <header className="edit-trip-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <IoArrowBackSharp size={20} />
        </button>
        <h1 className="edit-trip-title">Edit Trip Report</h1>
      </header>

      <form onSubmit={handleSubmit}>
        <div className="edit-trip-content">
          <div className="edit-trip-row">
            <p className="edit-trip-label">Trip Code</p>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="edit-trip-row">
            <p className="edit-trip-label">Location (Country)</p>
            <div className="input-with-icon">
              <input
                type="text"
                name="location.country"
                value={formData.location.country}
                onChange={handleChange}
                placeholder="Country"
                required
              />
              <IoLocationOutline size={20} />
            </div>
          </div>

          <div className="edit-trip-row">
            <p className="edit-trip-label">Location (City, optional)</p>
            <div className="input-with-icon">
              <input
                type="text"
                name="location.city"
                value={formData.location.city}
                onChange={handleChange}
                placeholder="City"
              />
              <IoLocate size={20} />
            </div>
          </div>

          <div className="edit-trip-row">
            <p className="edit-trip-label">Trip Start Date and Time</p>
            <input
              type="datetime-local"
              name="tripDate.startDate"
              value={formData.tripDate.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="edit-trip-row">
            <p className="edit-trip-label">Trip End Date and Time</p>
            <input
              type="datetime-local"
              name="tripDate.endDate"
              value={formData.tripDate.endDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="edit-trip-row">
            <p className="edit-trip-label">No. of Hotel Breakfast</p>
            <div className="input-with-icon">
              <input
                type="number"
                name="hotelBreakfastDays"
                value={formData.hotelBreakfastDays}
                onChange={handleChange}
                min="0"
                required
              />
              <IoChevronDownOutline size={20} />
            </div>
            {alertMessage && <p className="error-message">{alertMessage}</p>}
          </div>

          <div className="edit-trip-row">
            <p className="edit-trip-label">Driving Mileage with Private Car (10km)</p>
            <div className="input-with-icon">
              <input
                type="number"
                name="mileageKm"
                value={formData.mileageKm}
                onChange={handleChange}
                min="0"
                required
              />
              <IoChevronDownOutline size={20} />
            </div>
          </div>

          <hr className="edit-trip-divider" />

          <div className="edit-trip-row">
            <p className="edit-trip-label">Total Traktamente Day(s)</p>
            <p className="edit-trip-value">
              {formData.calculatedData?.totalDays || 0} day(s)
            </p>
          </div>

          <div className="edit-trip-row">
            <p className="edit-trip-label">Total Amount</p>
            <p className="edit-trip-value">
              {formData.calculatedData?.totalAmount || 0} SEK
            </p>
          </div>

          <hr className="edit-trip-divider" />

          <div className="edit-trip-row">
            <p className="edit-trip-label">Status:</p>
            <p className="edit-trip-value status-value">
              {formData.status}
            </p>
          </div>
        </div>

        <div className="edit-trip-actions">
          <button
            type="submit"
            className={`primary-btn ${isModified() ? "" : "primary-btn-disabled"}`}
            disabled={!isModified()}
          >
            Save
          </button>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTrip;
