import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { IoArrowBackSharp } from "react-icons/io5";
import "../styles/tripDetail.css"; // Reuse styles from TripDetail

const BASE_URL = import.meta.env.VITE_BASE_URL;

const EditTrip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState(null);

  // Helper to format date for `datetime-local`
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
      setLoading(false);
    } else {
      fetchTrip();
    }
  }, [id, state]);

  const calculateDaysAndAmount = () => {
    if (!formData.tripDate.startDate || !formData.tripDate.endDate) return;

    const startDate = new Date(formData.tripDate.startDate);
    const endDate = new Date(formData.tripDate.endDate);

    let totalDays = 0;

    // Calculate start day
    const startHour = startDate.getHours();
    if (startHour >= 12) {
      totalDays += 0.5; // PM counts as 0.5 day
    } else {
      totalDays += 1; // AM counts as 1 full day
    }

    // Calculate end day
    const endHour = endDate.getHours();
    if (endHour < 12) {
      totalDays += 0.5; // AM counts as 0.5 day
    } else {
      totalDays += 1; // PM counts as 1 full day
    }

    // Calculate full days in between
    const fullDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
    if (fullDays > 0) {
      totalDays += fullDays - 1; // Subtract 1 to exclude start and end days
    }

    // Validate hotelBreakfastDays
    if (formData.hotelBreakfastDays > totalDays) {
      setAlertMessage("Hotel Breakfast Days cannot exceed the total trip days.");
    } else {
      setAlertMessage(null);
    }

    // Calculate total amount (standardAmount is a placeholder)
    const standardAmount = 500; // Placeholder
    const totalAmount =
      totalDays * standardAmount -
      formData.hotelBreakfastDays * 52 +
      (formData.mileageKm / 10) * 25;

    setFormData((prev) => ({
      ...prev,
      calculatedData: { totalDays, totalAmount },
    }));
  };


  useEffect(() => {
    if (formData) calculateDaysAndAmount();
  }, [formData?.tripDate, formData?.hotelBreakfastDays, formData?.mileageKm]);

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
    <div className="trip-detail-container">
      <header className="trip-detail-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <IoArrowBackSharp size={20} />
        </button>
        <h1>Edit Trip</h1>
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
                placeholder="City"
              />
              <input
                type="text"
                name="location.country"
                value={formData.location.country}
                onChange={handleChange}
                placeholder="Country"
                required
              />
            </div>
          </div>

          <div className="trip-detail-row">
            <p className="trip-detail-label">Trip Start</p>
            <input
              type="datetime-local"
              name="tripDate.startDate"
              value={formData.tripDate.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="trip-detail-row">
            <p className="trip-detail-label">Trip End</p>
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
            {alertMessage && <p className="error-message">{alertMessage}</p>}
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
            <p className="trip-detail-label">Total Traktamente Day(s)</p>
            <p className="trip-detail-value">
              {formData.calculatedData?.totalDays || 0} day(s)
            </p>
          </div>

          <div className="trip-detail-row">
            <p className="trip-detail-label">Total Amount</p>
            <p className="trip-detail-value">
              {formData.calculatedData?.totalAmount || 0} SEK
            </p>
          </div>
        </div>

        <button type="submit" className="primary-btn">
          Update Trip
        </button>
      </form>
    </div>
  );
};

export default EditTrip;
