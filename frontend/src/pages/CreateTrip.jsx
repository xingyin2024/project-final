import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBackSharp } from "react-icons/io5";
import "../styles/tripDetail.css"; // Reuse TripDetail styles

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
  const [alertMessage, setAlertMessage] = useState(null);
  const [totalDays, setTotalDays] = useState(0);
  const [calculatedData, setCalculatedData] = useState({
    totalDays: 0,
    totalAmount: 0,
  });

  // Helper to calculate total days and amount
  const calculateDaysAndAmount = () => {
    if (!formData.tripDate.startDate || !formData.tripDate.endDate) return;

    const startDate = new Date(formData.tripDate.startDate);
    const endDate = new Date(formData.tripDate.endDate);

    let calculatedDays = 0;

    // Calculate start day
    const startHour = startDate.getHours();
    calculatedDays += startHour >= 12 ? 0.5 : 1;

    // Calculate end day
    const endHour = endDate.getHours();
    calculatedDays += endHour < 12 ? 0.5 : 1;

    // Calculate full days in between
    const fullDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
    if (fullDays > 0) {
      calculatedDays += fullDays - 1; // Subtract 1 to exclude start and end days
    }

    setTotalDays(calculatedDays);

    // Validate hotelBreakfastDays
    if (formData.hotelBreakfastDays > calculatedDays) {
      setAlertMessage("Hotel Breakfast Days cannot exceed the total trip days.");
    } else {
      setAlertMessage(null);
    }

    // Calculate total amount (standardAmount is a placeholder)
    const standardAmount = 500; // Placeholder
    const calculatedAmount =
      calculatedDays * standardAmount -
      formData.hotelBreakfastDays * 52 +
      (formData.mileageKm / 10) * 25;

    setTotalAmount(calculatedAmount);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "tripDate.startDate") {
      const newStartDate = new Date(value);
      const currentEndDate = new Date(formData.tripDate.endDate);

      if (newStartDate > currentEndDate) {
        // Adjust end date to one day after the new start date
        const newEndDate = new Date(newStartDate);
        newEndDate.setDate(newStartDate.getDate() + 1);

        setFormData((prev) => ({
          ...prev,
          tripDate: {
            ...prev.tripDate,
            startDate: value,
            endDate: newEndDate.toISOString().slice(0, 16),
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

    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(`${BASE_URL}/trips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: accessToken,
        },
        body: JSON.stringify({
          ...formData,
          calculatedData: { totalDays, totalAmount },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create trip.");
      }

      // Navigate to Dashboard after successful creation
      navigate("/dashboard");
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div className="trip-detail-container">
      <header className="trip-detail-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <IoArrowBackSharp size={20} />
        </button>
        <h1>Create Trip Report</h1>
      </header>

      <form onSubmit={handleSubmit}>
        <div className="trip-detail-content">
          <div className="trip-detail-row">
            <p className="trip-detail-label">Trip Code</p>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter your Trip Code"
              required
            />
          </div>

          <div className="trip-detail-row">
            <p className="trip-detail-label">Location</p>
            <div>
              <input
                type="text"
                name="location.city"
                value={formData.location.city}
                onChange={handleChange}
                placeholder="Enter City"
              />
              <input
                type="text"
                name="location.country"
                value={formData.location.country}
                onChange={handleChange}
                placeholder="Enter Country"
                required
              />
            </div>
          </div>

          <div className="trip-detail-row">
            <p className="trip-detail-label">Trip Start Date and Time</p>
            <input
              type="datetime-local"
              name="tripDate.startDate"
              value={formData.tripDate.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="trip-detail-row">
            <p className="trip-detail-label">Trip End Date and Time</p>
            <input
              type="datetime-local"
              name="tripDate.endDate"
              value={formData.tripDate.endDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="trip-detail-row">
            <p className="trip-detail-label">No. of Hotel Breakfast</p>
            <input
              type="number"
              name="hotelBreakfastDays"
              value={formData.hotelBreakfastDays}
              onChange={handleChange}
              min="0"
              required
            />
            {alertMessage && (
              <p className="error-message">{alertMessage}</p>
            )}
          </div>

          <div className="trip-detail-row">
            <p className="trip-detail-label">Driving Mileage with Private Car (10km)</p>
            <input
              type="number"
              name="mileageKm"
              value={formData.mileageKm}
              onChange={handleChange}
              min="0"
              required
            />
          </div>

          <hr className="trip-detail-divider" />

          <div className="trip-detail-row">
            <p className="trip-detail-label">Total Traktamente Day</p>
            <p className="trip-detail-value">{totalDays} day(s)</p>
          </div>

          <div className="trip-detail-row">
            <p className="trip-detail-label">Total Amount</p>
            <p className="trip-detail-value">{totalAmount} SEK</p>
          </div>
        </div>

        {/* Add navigation to tripDetail page with the trip data after successful creation or show proper error if submition when wrong*/}
        <button type="submit" className="primary-btn">
          Save
        </button>
      </form>
    </div>
  );
};

export default CreateTrip;
