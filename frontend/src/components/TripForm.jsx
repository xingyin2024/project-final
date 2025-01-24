import PropTypes from 'prop-types';
import { IoLocationOutline, IoLocate } from 'react-icons/io5';
import AlertMessage from '../components/AlertMessage';
import '../styles/tripForm.css';

/**
 * A purely "fields-only" component that renders the input fields for a trip,
 * but no <form> tag and no Save/Cancel buttons. The parent controls the form.
 */
const TripForm = ({
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
  includeStatus = false,
}) => {
  return (
    <div className="trip-form-content">
      {/* Title Input */}
      <div className="trip-form-row">
        <p className="trip-form-label">Trip Code</p>
        <input
          type="text"
          name="title"
          value={formData.title || ''}
          placeholder="Code characters: min 2, max 50"
          onChange={handleChange}
          required
          minLength={2}
          maxLength={50}
        />
      </div>

      {/* Country Input */}
      <div className="trip-form-row">
        <p className="trip-form-label">Location (Country)</p>
        <div className="input-with-icon">
          <input
            type="text"
            className="dropdown-input"
            value={formData?.location?.country || ''}
            placeholder="Select or type Country"
            onChange={(e) => handleInputChange('country', e.target.value)}
            onBlur={() => validateCountry()}
            required
          />
          <IoLocationOutline
            size={20}
            onClick={() => toggleDropdown('country')}
          />
          {dropdownState.country && (
            <ul className="dropdown">
              {countrySuggestions.map((item, index) => (
                <li
                  key={index}
                  onClick={() =>
                    handleSelect('country', item['country or territory'])
                  }
                  className="dropdown-item"
                >
                  {item['country or territory']}
                </li>
              ))}
            </ul>
          )}
        </div>
        <AlertMessage message={getAlert('country')} />
      </div>

      {/* City Input */}
      <div className="trip-form-row">
        <p className="trip-form-label">Location (City, optional)</p>
        <div className="input-with-icon">
          <input
            type="text"
            className="dropdown-input"
            value={formData?.location?.city || ''}
            placeholder="Select or type City"
            onChange={(e) => handleInputChange('city', e.target.value)}
          />
          <IoLocate size={20} onClick={() => toggleDropdown('city')} />
          {dropdownState.city && (
            <ul className="dropdown">
              {citySuggestions.map((city, index) => (
                <li
                  key={index}
                  onClick={() => handleSelect('city', city)}
                  className="dropdown-item"
                >
                  {city}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Start and End Date Inputs */}
      <div className="trip-form-row">
        <p className="trip-form-label">Trip Start Date and Time</p>
        <input
          type="datetime-local"
          name="tripDate.startDate"
          value={formData.tripDate?.startDate || ''}
          onChange={handleChange}
          required
        />
      </div>
      <div className="trip-form-row">
        <p className="trip-form-label">Trip End Date and Time</p>
        <input
          type="datetime-local"
          name="tripDate.endDate"
          value={formData.tripDate?.endDate || ''}
          onChange={handleChange}
          required
        />
        <AlertMessage message={getAlert('tripDate')} />
      </div>

      {/* totalDays user override input */}
      <div className="trip-form-row">
        <p className="trip-form-label">Total Traktamente Day</p>
        <input
          type="number"
          name="calculatedData.totalDays"
          step="0.5"
          min="0"
          value={formData.calculatedData?.totalDays ?? ''}
          onChange={handleChange}
          className="trip-form-input"
        />
      </div>

      {/* Hotel Breakfast and Mileage Inputs */}
      <div className="trip-form-row">
        <p className="trip-form-label">No. of Hotel Breakfast (days)</p>
        <input
          type="number"
          name="hotelBreakfastDays"
          value={formData.hotelBreakfastDays || '0'}
          onChange={handleChange}
          min="0"
          required
        />
        <AlertMessage message={getAlert('hotelBreakfastDays')} />
      </div>
      <div className="trip-form-row">
        <p className="trip-form-label">Driving Mil with Private Car (mil)</p>
        <input
          type="number"
          name="mileageKm"
          value={formData.mileageKm || '0'}
          onChange={handleChange}
          min="0"
          required
        />
      </div>

      <hr className="trip-form-divider" />

      {/* Summary */}
      <div className="trip-form-row">
        <p className="trip-form-label">Total Traktamente Day(s)</p>
        <p className="trip-form-value total-value">
          {formData.calculatedData?.totalDays || 0} day(s)
        </p>
      </div>
      <div className="trip-form-row">
        <p className="trip-form-label total-label">Total Amount</p>
        <p className="total-value">
          {formData.calculatedData?.totalAmount || 0} SEK
        </p>
      </div>

      {/* Total Amount Calculation Formula */}
      <div className="trip-form-row">
        <p className="trip-form-label">Calculation Formula:</p>
        <p className="trip-form-note">
          {formData.calculatedData?.totalDays === 0
            ? 'Total Amount = 0 kr (since total days is 0).'
            : `Total Amount = (${
                formData.calculatedData?.totalDays || 0
              } days × 
           ${formData.calculatedData?.standardAmount || 'N/A'} kr) - (
           ${formData.hotelBreakfastDays} breakfast days × 58 kr) + (
           ${formData.mileageKm} mil × 25 kr)`}
        </p>
      </div>

      {includeStatus && (
        <>
          <hr className="trip-form-divider" />
          <div className="trip-form-row">
            <p className="trip-form-label">Status:</p>
            <p
              className={`trip-form-status ${formData?.status
                ?.toLowerCase()
                .replace(' ', '-')}`}
            >
              {formData?.status?.charAt(0).toUpperCase() +
                formData?.status?.slice(1)}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

TripForm.propTypes = {
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
  includeStatus: PropTypes.bool,
};

export default TripForm;
