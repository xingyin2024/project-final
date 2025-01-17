import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { IoArrowBackSharp, IoLocationOutline, IoLocate } from "react-icons/io5";
import favoriteCities from "../assets/fav-city.json";
import useUniqueCountries from "../hooks/useUniqueCountries";
import useAlert from "../hooks/useAlert";
import AlertMessage from "../components/AlertMessage";
import "../styles/editTrip.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const EditTrip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const sortedCountries = useUniqueCountries();
  
  // State for managing form data, dropdowns, errors, and alerts
  const [formData, setFormData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [dropdownState, setDropdownState] = useState({ country: false, city: false });
  const [countrySuggestions, setCountrySuggestions] = useState([]);
  const [citySuggestions, setCitySuggestions] = useState([]);
  // const [alertMessage, setAlertMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setAlert, clearAlert, getAlert } = useAlert();

  // Helper to format dates for datetime-local inputs
  const formatDateForInput = (date) => new Date(date).toISOString().slice(0, 16);

  // Fetch trip data from the backend or initialize from state
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await fetch(`${BASE_URL}/trips/${id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json", Authorization: accessToken },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to fetch trip details.");

        const formattedTripDate = {
          startDate: formatDateForInput(data.data.tripDate.startDate),
          endDate: formatDateForInput(data.data.tripDate.endDate),
        };

        setFormData({ ...data.data, tripDate: formattedTripDate }); // Set form data
        setOriginalData({ ...data.data, tripDate: formattedTripDate }); // Set original data
      } catch (err) {
        setError(err.message);
        setAlert("general", "Error fetching trip details.");
      } finally {
        setLoading(false);
      }
    };

    if (state?.trip) {
      const formattedTripDate = {
        startDate: formatDateForInput(state.trip.tripDate.startDate),
        endDate: formatDateForInput(state.trip.tripDate.endDate),
      };
      setFormData({ ...state.trip, tripDate: formattedTripDate }); // Initialize form data
      setOriginalData({ ...state.trip, tripDate: formattedTripDate }); // Initialize original data
      setLoading(false); // Stop loading
    } else {
      fetchTrip();
    }
  }, [id, state]);

  // Check if form data has been modified
  const isModified = () => JSON.stringify(formData) !== JSON.stringify(originalData);

  // Handle general input changes
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

  // Handle input changes and validate country input
  const handleInputChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, [key]: value },
    }));

    if (key === "country") {
      const matches = sortedCountries.filter((item) =>
        item["country or territory"].toLowerCase().startsWith(value.toLowerCase())
      );
      setCountrySuggestions(matches);
      setDropdownState((prev) => ({ ...prev, country: true }));
      validateCountry(value);
    } else if (key === "city") {
      const matches = favoriteCities.filter((city) =>
        city.toLowerCase().startsWith(value.toLowerCase())
      );
      setCitySuggestions(matches);
      setDropdownState((prev) => ({ ...prev, city: true }));
    }
  };

  // Validate country input
  const validateCountry = (inputValue = formData.location.country) => {
    const trimmedCountry = inputValue?.trim().toLowerCase();
    const isValid = sortedCountries.some(
      (item) => item["country or territory"].toLowerCase() === trimmedCountry
    );

    if (!trimmedCountry) setAlert("country", "Country field cannot be empty.");
    else if (!isValid) setAlert("country", "No matched country found, please check your location.");
    else clearAlert("country");
  };

  // Handle dropdown selection and reset suggestions
  const handleSelect = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, [key]: value.trim() },
    }));
    setDropdownState((prev) => ({ ...prev, [key]: false }));
    if (key === "country") {
      setCountrySuggestions([]);
      validateCountry(value.trim());
    }
    if (key === "city") setCitySuggestions([]);
  };

  // Toggle dropdown visibility
  const toggleDropdown = (key) => {
    setDropdownState((prev) => ({ ...prev, [key]: !prev[key] }));

    // Reset suggestions if the dropdown is opened without typing
    if (key === "country" && !dropdownState.country) setCountrySuggestions(sortedCountries); // Show all countries
    if (key === "city" && !dropdownState.city) setCitySuggestions(favoriteCities); // Show all cities
  };

  // Calculate total days and amount
  const calculateDaysAndAmount = () => {
    if (!formData.tripDate.startDate || !formData.tripDate.endDate) return;

    const startDate = new Date(formData.tripDate.startDate);
    const endDate = new Date(formData.tripDate.endDate);
    let totalDays = 0;

    totalDays += startDate.getHours() >= 12 ? 0.5 : 1;
    totalDays += endDate.getHours() < 12 ? 0.5 : 1;

    const fullDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
    if (fullDays > 0) totalDays += fullDays - 1;

    // Validate hotelBreakfastDays
    if (formData.hotelBreakfastDays > totalDays) {
      setAlert("hotelBreakfastDays", "Hotel Breakfast Days cannot exceed the total trip days.");
    } else {
      clearAlert("hotelBreakfastDays");
    }

    // Calculate total amount (standardAmount is a placeholder)
    const standardAmount = 500; // Placeholder for standard amount
    const totalAmount =
      totalDays * standardAmount - formData.hotelBreakfastDays * 52 + formData.mileageKm * 25;

    setFormData((prev) => ({ ...prev, calculatedData: { totalDays, totalAmount } }));
  };

  // Recalculate when relevant fields change
  useEffect(() => {
    if (formData) calculateDaysAndAmount();
  }, [formData?.tripDate, formData?.hotelBreakfastDays, formData?.mileageKm]);

  // Submit updated trip data
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isModified()) return;

    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(`${BASE_URL}/trips/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update trip.");
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
      setAlert("general", "Error updating trip details.");
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
        <h1 className="edit-trip-title">Edit Trip</h1>
      </header>

      <form onSubmit={handleSubmit}>
        <div className="edit-trip-content">
          {/* Title Input */}
          <div className="edit-trip-row">
            <p className="edit-trip-label">Trip Code</p>
            <input
              type="text"
              name="title"
              value={formData.title}
              placeholder="Select or type Trip Code"
              onChange={handleChange}
              required
            />
          </div>

          {/* Country Input */}
          <div className="edit-trip-row">
            <p className="edit-trip-label">Location (Country)</p>
            <div className="input-with-icon">
              <input
                type="text"
                className="dropdown-input"
                value={formData?.location?.country || ""}
                placeholder="Select or type Country"
                onChange={(e) => handleInputChange("country", e.target.value)}
                onBlur={() => validateCountry()}
                required
              />
              <IoLocationOutline size={20} onClick={() => toggleDropdown("country")} />
              {dropdownState.country && (
                <ul className="dropdown">
                  {countrySuggestions.map((item, index) => (
                    <li
                      key={index}
                      onClick={() => handleSelect("country", item["country or territory"])}
                      className="dropdown-item"
                    >
                      {item["country or territory"]}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <AlertMessage message={getAlert("country")} />
          </div>

          {/* City Input */}
          <div className="edit-trip-row">
            <p className="edit-trip-label">Location (City, optional)</p>
            <div className="input-with-icon">
              <input
                type="text"
                className="dropdown-input"
                value={formData?.location?.city || ""}
                placeholder="Select or type City"
                onChange={(e) => handleInputChange("city", e.target.value)}
              />
              <IoLocate size={20} onClick={() => toggleDropdown("city")} />
              {dropdownState.city && (
                <ul className="dropdown">
                  {citySuggestions.map((city, index) => (
                    <li key={index} onClick={() => handleSelect("city", city)} className="dropdown-item">
                      {city}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Start and End Date Inputs */}
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

          {/* Hotel Breakfast and Mileage Inputs */}
          <div className="edit-trip-row">
            <p className="edit-trip-label">No. of Hotel Breakfast</p>
            <input
              type="number"
              name="hotelBreakfastDays"
              value={formData.hotelBreakfastDays || "0"}
              onChange={handleChange}
              min="0"
              required
            />
            <AlertMessage message={getAlert("hotelBreakfastDays")} />
          </div>
          <div className="edit-trip-row">
            <p className="edit-trip-label">Driving Mileage with Private Car (10km)</p>
            <input
              type="number"
              name="mileageKm"
              value={formData.mileageKm || "0"}
              onChange={handleChange}
              min="0"
              required
            />
          </div>

          <hr className="edit-trip-divider" />

          {/* Summary */}
          <div className="edit-trip-row">
            <p className="edit-trip-label">Total Traktamente Day(s)</p>
            <p className="edit-trip-value">{formData.calculatedData?.totalDays || 0} day(s)</p>
          </div>
          <div className="edit-trip-row">
            <p className="edit-trip-label">Total Amount</p>
            <p className="edit-trip-value">{formData.calculatedData?.totalAmount || 0} SEK</p>
          </div>

          <hr className="edit-trip-divider" />

          <div className="edit-trip-row">
            <p className="edit-trip-label">Status:</p>
            <p className="edit-trip-value status-value">{formData.status}</p>
          </div>
        </div>

        <div className="edit-trip-actions">
          <button type="submit" className={`primary-btn ${isModified() ? "" : "primary-btn-disabled"}`} disabled={!isModified()}>
            Save
          </button>
          <button type="button" className="secondary-btn" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTrip;
