import React from "react";
import PropTypes from "prop-types";
import { IoLocationOutline, IoLocate } from "react-icons/io5";
import AlertMessage from "../components/AlertMessage";
import "../styles/tripCard.css";

const TripCard = ({
  formData,
  handleChange,
  handleInputChange,
  validateCountry,
  toggleDropdown,
  dropdownState,
  countrySuggestions,
  citySuggestions,
  handleSelect,
  getAlert,
  onSubmit,
  isModified,
  hasActiveAlerts,
  includeStatus = false,
  navigate, // Add navigate
  id, // Add id
}) => (
  <form onSubmit={onSubmit}>
    <div className="trip-card-content">
      {/* Title Input */}
      <div className="trip-card-row">
        <p className="trip-card-label">Trip Code</p>
        <input
          type="text"
          name="title"
          value={formData.title || ""}
          placeholder="Select or type Trip Code"
          onChange={handleChange}
          required
        />
      </div>

      {/* Country Input */}
      <div className="trip-card-row">
        <p className="trip-card-label">Location (Country)</p>
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
      <div className="trip-card-row">
        <p className="trip-card-label">Location (City, optional)</p>
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
      <div className="trip-card-row">
        <p className="trip-card-label">Trip Start Date and Time</p>
        <input
          type="datetime-local"
          name="tripDate.startDate"
          value={formData.tripDate?.startDate || ""}
          onChange={handleChange}
          required
        />
      </div>
      <div className="trip-card-row">
        <p className="trip-card-label">Trip End Date and Time</p>
        <input
          type="datetime-local"
          name="tripDate.endDate"
          value={formData.tripDate?.endDate || ""}
          onChange={handleChange}
          required
        />
      </div>

      {/* Hotel Breakfast and Mileage Inputs */}
      <div className="trip-card-row">
        <p className="trip-card-label">No. of Hotel Breakfast</p>
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
      <div className="trip-card-row">
        <p className="trip-card-label">Driving Mileage with Private Car (1 mil = 10 km)</p>
        <input
          type="number"
          name="mileageKm"
          value={formData.mileageKm || "0"}
          onChange={handleChange}
          min="0"
          required
        />
      </div>

      <hr className="trip-card-divider" />

      {/* Summary */}
      <div className="trip-card-row">
        <p className="trip-card-label">Total Traktamente Day(s)</p>
        <p className="trip-card-value">{formData.calculatedData?.totalDays || 0} day(s)</p>
      </div>
      <div className="trip-card-row">
        <p className="trip-card-label">Total Amount</p>
        <p className="trip-card-value">{formData.calculatedData?.totalAmount || 0} SEK</p>
      </div>

      {includeStatus && (
        <>
          <hr className="trip-card-divider" />
          <div className="trip-card-row">
            <p className="trip-card-label">Status:</p>
            <p className="trip-card-value status-value">{formData.status}</p>
          </div>
        </>
      )}
      </div>

      <div className="trip-card-actions">
      <button
        type="submit"
        className={`primary-btn ${isModified && !hasActiveAlerts ? "" : "primary-btn-disabled"}`}
        disabled={!isModified || hasActiveAlerts}
      >
        Save
      </button>
        <button type="button" className="secondary-btn" onClick={() => navigate(`/trip/${id}`)}>
          Cancel
        </button>
    </div>
  </form>
);

TripCard.propTypes = {
  formData: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  validateCountry: PropTypes.func.isRequired,
  toggleDropdown: PropTypes.func.isRequired,
  dropdownState: PropTypes.object.isRequired,
  countrySuggestions: PropTypes.array.isRequired,
  citySuggestions: PropTypes.array.isRequired,
  handleSelect: PropTypes.func.isRequired,
  getAlert: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isModified: PropTypes.bool.isRequired,
  hasActiveAlerts: PropTypes.bool.isRequired,
  includeStatus: PropTypes.bool,
};

export default TripCard;
