import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Your hooks
import useUniqueCountries from '../hooks/useUniqueCountries';
import useAlert from '../hooks/useAlert';
import { useUser } from '../context/UserContext';

// Your subcomponents
import TripFormHeader from './TripFormHeader';
import TripFormButtons from './TripFormButtons';
import TripDayCalculator from './TripDayCalculator';
import AlertMessage from './AlertMessage'; // for alert display

// JSON data for amounts/cities
import countriesData from '../assets/traktamente-en.json';
import favoriteCities from '../assets/fav-city.json';
import { IoLocationOutline, IoLocate } from 'react-icons/io5';
import '../styles/tripForm.css';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8080';

/**
 * A single form component that handles both "create" and "edit" trip logic,
 * including country/city dropdown, date auto-fix, day calculation, and alerts,
 * plus a new "Final Amount" option for admin to pick 50%/75%/100%.
 */
export default function TripForm({ mode = 'create', tripId }) {
  const navigate = useNavigate();
  const sortedCountries = useUniqueCountries(); // Unique country list
  const { user, isAdmin } = useUser(); // for user?.role checks
  const { setAlert, getAlert, clearAlert } = useAlert(); // field-level alerts

  // Loading & error states
  const [loading, setLoading] = useState(mode === 'edit'); // if edit, we fetch
  const [error, setError] = useState(null);

  // -----------------------------------
  // 1) TRIP STATE
  // -----------------------------------
  const [trip, setTrip] = useState({
    title: '',
    location: {
      country: '',
      city: '',
    },
    tripDate: {
      startDate: '',
      endDate: '',
    },
    hotelBreakfastDays: 0,
    mileageKm: 0,
    status: 'not submitted',
    calculatedData: {
      totalDays: 0,
      totalAmount: 0,
      standardAmount: 0,
      finalAmount: 0, // <-- We'll store the chosen 50%/75%/100% result here
    },
  });

  // (Used to store the user's existing trips for date range validation in "create" and "edit" modes)
  const [userTrips, setUserTrips] = useState([]);

  // (Used to compare if trip changed in "edit" mode)
  const [originalTrip, setOriginalTrip] = useState(null);

  // Manual override: if user types totalDays themselves
  const [manualOverride, setManualOverride] = useState(false);

  // -----------------------------------
  // 2) DROPDOWN STATE
  // -----------------------------------
  const [dropdownState, setDropdownState] = useState({
    country: false,
    city: false,
  });
  const [countrySuggestions, setCountrySuggestions] = useState([]);
  const [citySuggestions, setCitySuggestions] = useState([]);

  // -----------------------------------
  // 3.1) FETCH TRIPS IF CREATE OR EDIT MODE
  // -----------------------------------
  useEffect(() => {
    if (mode === 'create' || mode === 'edit') {
      fetchAllUserTrips();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Fetch * all * existing trips for the logged-in user
  const fetchAllUserTrips = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No access token found. Please log in.');
        return;
      }
      const response = await fetch(`${BASE_URL}/trips?userId=${user.id}`, {
        headers: { Authorization: token },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user trips.');
      }
      const existingTrips = data.data || [];
      setUserTrips(existingTrips);
    } catch (err) {
      setError(err.message);
    }
  };

  // -----------------------------------
  // 3.2) FETCH TRIP IF EDIT MODE
  // -----------------------------------
  useEffect(() => {
    if (mode === 'edit' && tripId) {
      fetchTrip();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, tripId]);

  const fetchTrip = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setError('Authorization token missing. Please log in.');
        navigate('/login');
        return;
      }

      const response = await fetch(`${BASE_URL}/trips/${tripId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: accessToken,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch trip details.');
      }

      const data = await response.json();
      const fetchedTrip = data.data;

      // Convert date strings to local datetime format
      const startLocal = formatDateForInput(fetchedTrip.tripDate.startDate);
      const endLocal = formatDateForInput(fetchedTrip.tripDate.endDate);

      // Merge into trip state
      const updatedTrip = {
        ...fetchedTrip,
        tripDate: {
          startDate: startLocal,
          endDate: endLocal,
        },
        calculatedData: {
          ...fetchedTrip.calculatedData,
          totalDays: fetchedTrip.calculatedData?.totalDays || 0,
          finalAmount: fetchedTrip.calculatedData?.finalAmount || 0,
        },
      };

      setTrip(updatedTrip);
      setOriginalTrip(updatedTrip);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper: format date for <input type="datetime-local" />
  const formatDateForInput = (date) =>
    new Date(date).toISOString().slice(0, 16);

  // -----------------------------------
  // 4) TRIPDAYCALCULATOR LOGIC
  // -----------------------------------
  const handleDaysCalculated = (autoDays) => {
    // If user has not manually overridden, we apply the autoDays
    setTrip((prev) => {
      if (manualOverride) return prev;
      if (prev.calculatedData.totalDays === autoDays) return prev; // no change
      return {
        ...prev,
        calculatedData: {
          ...prev.calculatedData,
          totalDays: autoDays,
        },
      };
    });
  };

  // -----------------------------------
  // 5) CALCULATE AMOUNT WHEN RELEVANT FIELDS CHANGE
  // -----------------------------------
  const calculateDaysAndAmount = () => {
    const { hotelBreakfastDays = 0, mileageKm = 0 } = trip;
    const { totalDays = 0 } = trip.calculatedData;

    // If totalDays=0 => no cost
    if (totalDays === 0) {
      setTrip((prev) => ({
        ...prev,
        calculatedData: {
          ...prev.calculatedData,
          totalDays: 0,
          totalAmount: 0,
          standardAmount: 0,
          finalAmount: 0, // reset final too
        },
      }));
      return;
    }

    // If breakfastDays > totalDays => alert
    if (hotelBreakfastDays > totalDays) {
      setAlert(
        'hotelBreakfastDays',
        'Hotel Breakfast Days cannot exceed the total trip days.'
      );
    } else {
      clearAlert('hotelBreakfastDays');
    }

    // Find standard amount from countriesData
    const tripYear = new Date(trip.tripDate.startDate).getFullYear();
    const countryData = countriesData.find(
      (item) =>
        item['country or territory'] === trip.location.country &&
        item.year === String(tripYear)
    );
    const standardAmount = countryData
      ? parseFloat(countryData['standard amount'])
      : 0;

    // Compute final (rounded)
    const rawTotal =
      totalDays * standardAmount - hotelBreakfastDays * 58 + mileageKm * 25;
    const total = Math.round(rawTotal); // no decimals

    setTrip((prev) => {
      return {
        ...prev,
        calculatedData: {
          ...prev.calculatedData,
          standardAmount,
          totalAmount: total, // now integer
          finalAmount: total, // also integer initially (100%)
        },
      };
    });
  };

  useEffect(() => {
    // Whenever relevant fields change, recalc
    if (
      trip.tripDate.startDate &&
      trip.tripDate.endDate &&
      trip.location.country
    ) {
      calculateDaysAndAmount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    trip.calculatedData.totalDays,
    trip.tripDate.startDate,
    trip.tripDate.endDate,
    trip.location.country,
    trip.hotelBreakfastDays,
    trip.mileageKm,
  ]);

  // -----------------------------------
  // 6) LOCATION (Country/City) DROPDOWN
  // -----------------------------------
  const handleInputChange = (key, value) => {
    // for typed country/city
    setTrip((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [key]: value,
      },
    }));

    if (key === 'country') {
      const matches = sortedCountries.filter((item) =>
        item['country or territory']
          .toLowerCase()
          .startsWith(value.toLowerCase())
      );
      setCountrySuggestions(matches);
      setDropdownState((prev) => ({ ...prev, country: true }));
      validateCountry(value);
    } else if (key === 'city') {
      const matches = favoriteCities.filter((city) =>
        city.toLowerCase().startsWith(value.toLowerCase())
      );
      setCitySuggestions(matches);
      setDropdownState((prev) => ({ ...prev, city: true }));
    }
  };

  const validateCountry = (val = trip.location.country) => {
    const trimmed = val.trim().toLowerCase();
    const isValid = sortedCountries.some(
      (item) => item['country or territory'].toLowerCase() === trimmed
    );

    if (!trimmed) {
      setAlert('country', 'Country cannot be empty.');
    } else if (!isValid) {
      setAlert('country', 'No matched country found, please check input.');
    } else {
      clearAlert('country');
    }
  };

  const handleSelect = (key, value) => {
    setTrip((prev) => ({
      ...prev,
      location: { ...prev.location, [key]: value.trim() },
    }));
    setDropdownState((prev) => ({ ...prev, [key]: false }));

    if (key === 'country') {
      setCountrySuggestions([]);
      validateCountry(value.trim());
    } else if (key === 'city') {
      setCitySuggestions([]);
    }
  };

  const toggleDropdown = (key) => {
    setDropdownState((prev) => ({ ...prev, [key]: !prev[key] }));
    if (key === 'country' && !dropdownState.country) {
      setCountrySuggestions(sortedCountries);
    }
    if (key === 'city' && !dropdownState.city) {
      setCitySuggestions(favoriteCities);
    }
  };

  // -----------------------------------
  // 7) DATES + handleChange & handleDateAutoFix
  // -----------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    // If user modifies the date => re-enable autoDays
    if (name === 'tripDate.startDate' || name === 'tripDate.endDate') {
      setManualOverride(false);
      handleDateAutoFix(name, value);
      return;
    }

    if (name.includes('calculatedData.')) {
      // e.g. "calculatedData.totalDays"
      const [_, field] = name.split('.');
      if (field === 'totalDays') {
        setManualOverride(true);
      }
      setTrip((prev) => ({
        ...prev,
        calculatedData: {
          ...prev.calculatedData,
          [field]: parseFloat(value) || 0,
        },
      }));
    } else {
      // top-level fields: e.g. "hotelBreakfastDays", "mileageKm", "title", etc.
      setTrip((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Automatic date correction and overlap validation
  const handleDateAutoFix = (fieldName, newVal) => {
    setTrip((prev) => {
      let updatedTrip = { ...prev };
      const newTripDate = { ...prev.tripDate };

      if (fieldName === 'tripDate.startDate') {
        newTripDate.startDate = newVal;
      } else if (fieldName === 'tripDate.endDate') {
        newTripDate.endDate = newVal;
      }

      updatedTrip.tripDate = newTripDate;

      // Validate the new date range
      validateDateRange(newTripDate.startDate, newTripDate.endDate, mode);
      return updatedTrip;
    });
  };

  const validateDateRange = (startDate, endDate, mode) => {
    // Parse dates
    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);

    // Check if start date is after end date
    if (newStart > newEnd) {
      // Adjust dates accordingly
      if (mode === 'create' || mode === 'edit') {
        // Decide which date to adjust. Here, we'll adjust the end date to be after the start date.
        setAlert('tripDate', 'End date was adjusted to be after Start date.');

        // Set end date to start date plus 1 day
        const adjustedEnd = new Date(newStart);
        adjustedEnd.setDate(adjustedEnd.getDate() + 1);
        const formattedEnd = formatDateForInput(adjustedEnd.toISOString());
        setTrip((prev) => ({
          ...prev,
          tripDate: {
            ...prev.tripDate,
            endDate: formattedEnd,
          },
        }));
      }
      return;
    }

    // Overlap Validation
    // In "edit" mode, exclude the current trip from overlap checks
    const overlappingTrip = userTrips.find((tripItem) => {
      if (mode === 'edit' && tripItem.id === tripId) return false; // Exclude current trip

      const existingStart = new Date(tripItem.tripDate.startDate);
      const existingEnd = new Date(tripItem.tripDate.endDate);

      // Check if the new trip overlaps with any existing trip
      return (
        (newStart >= existingStart && newStart <= existingEnd) ||
        (newEnd >= existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      );
    });

    if (overlappingTrip) {
      setAlert(
        'tripDate',
        `The selected dates overlap with an existing trip: "${
          overlappingTrip.title
        }" from ${formatDateDisplay(
          overlappingTrip.tripDate.startDate
        )} to ${formatDateDisplay(overlappingTrip.tripDate.endDate)}.`
      );
    } else {
      clearAlert('tripDate');
    }
  };

  // Helper function to format dates for display in alerts
  const formatDateDisplay = (dateStr) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  // -----------------------------------
  // 8) FORM VALIDATION
  // -----------------------------------
  const isFormValid = () => {
    // Basic checks: title, country, start/end date
    if (!trip.title.trim()) return false;
    if (!trip.location.country.trim()) return false;
    if (!trip.tripDate.startDate) return false;
    if (!trip.tripDate.endDate) return false;

    // Check for trip date alerts
    if (getAlert('tripDate')) return false;

    // Additional validations can be added here

    return true;
  };

  // For "edit" mode, see if something changed
  const isModified = () => {
    if (!originalTrip) return true; // if we haven't loaded original yet
    return JSON.stringify(trip) !== JSON.stringify(originalTrip);
  };

  const hasActiveAlerts = () => {
    const alerts = getAlert() || {};
    // Return true if any alert messages exist
    return Object.values(alerts).some((msg) => !!msg);
  };

  // -----------------------------------
  // 9) SUBMIT (POST or PATCH)
  // -----------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (hasActiveAlerts()) return; // prevent submission if alerts are active
    if (!isFormValid()) return;

    if (mode === 'edit' && !isModified()) {
      // No changes => skip
      navigate(`/trip/${tripId}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No access token found. Please log in.');
        return;
      }

      let url = `${BASE_URL}/trips`;
      let method = 'POST';
      if (mode === 'edit' && tripId) {
        url = `${BASE_URL}/trips/${tripId}`;
        method = 'PATCH';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify(trip),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save trip.');
      }

      // After success, navigate
      if (mode === 'create') {
        navigate('/dashboard', { state: { created: true } });
      } else {
        navigate(`/trip/${tripId}`, { state: { updated: true } });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------
  // Handle finalAmount changes
  // (when admin chooses 50%, 75%, 100%)
  // -----------------------------------
  const handleFinalAmountChange = (pct) => {
    // totalAmount * (0.5 or 0.75 or 1)
    const total = trip.calculatedData?.totalAmount || 0;
    const rawFinal = total * pct;
    const finalCalc = Math.round(rawFinal);

    setTrip((prev) => ({
      ...prev,
      calculatedData: {
        ...prev.calculatedData,
        finalAmount: finalCalc, // integer
      },
    }));
  };

  const ratio =
    trip.calculatedData?.finalAmount / trip.calculatedData?.totalAmount;

  // -----------------------------------
  // RENDER
  // -----------------------------------
  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="trip-form-container">
      <TripFormHeader
        title={mode === 'create' ? 'Create Trip Report' : 'Edit Trip Report'}
        onBack={() =>
          mode === 'create'
            ? navigate('/dashboard')
            : navigate(`/trip/${tripId}`)
        }
      />

      <form onSubmit={handleSubmit}>
        <TripDayCalculator
          startDateTime={trip.tripDate.startDate}
          endDateTime={trip.tripDate.endDate}
          onDaysCalculated={handleDaysCalculated}
        />

        <div className="trip-form-content">
          {/* Trip Title */}
          <div className="trip-form-row">
            <label htmlFor="trip-title" className="trip-form-label">
              Trip Code
            </label>
            <input
              className="trip-form-input"
              id="trip-title"
              type="text"
              name="title"
              value={trip.title}
              placeholder="Code characters: min 2, max 50"
              onChange={handleChange}
              required
              minLength={2}
              maxLength={50}
            />
          </div>

          {/* Country */}
          <div className="trip-form-row">
            <label htmlFor="country-input" className="trip-form-label">
              Location (Country)
            </label>
            <div className="input-with-icon">
              <input
                id="country-input"
                type="text"
                className="dropdown-input"
                value={trip.location.country}
                placeholder="Select or type Country"
                onChange={(e) => handleInputChange('country', e.target.value)}
                onBlur={() => validateCountry()}
                required
                aria-expanded={dropdownState.country}
                aria-haspopup="listbox"
              />
              {/* Use a button for the dropdown toggle */}
              <button
                type="button"
                className="icon-button"
                aria-label="Toggle country list"
                onClick={() => toggleDropdown('country')}
              >
                <IoLocationOutline size={20} />
              </button>

              {dropdownState.country && (
                <ul
                  className="dropdown"
                  role="listbox"
                  aria-label="Country suggestions"
                >
                  {countrySuggestions.map((item, index) => (
                    <li
                      key={index}
                      role="option"
                      tabIndex={0}
                      className="dropdown-item"
                      onClick={() =>
                        handleSelect('country', item['country or territory'])
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleSelect('country', item['country or territory']);
                        }
                      }}
                    >
                      {item['country or territory']}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <AlertMessage message={getAlert('country')} />
          </div>

          {/* City */}
          <div className="trip-form-row">
            <label htmlFor="city-input" className="trip-form-label">
              Location (City, optional)
            </label>
            <div className="input-with-icon">
              <input
                id="city-input"
                type="text"
                className="dropdown-input"
                value={trip.location.city}
                placeholder="Select or type City"
                onChange={(e) => handleInputChange('city', e.target.value)}
                aria-expanded={dropdownState.city}
                aria-haspopup="listbox"
              />
              <button
                type="button"
                className="icon-button"
                aria-label="Toggle city list"
                onClick={() => toggleDropdown('city')}
              >
                <IoLocate size={20} />
              </button>

              {dropdownState.city && (
                <ul
                  className="dropdown"
                  role="listbox"
                  aria-label="City suggestions"
                >
                  {citySuggestions.map((city, index) => (
                    <li
                      key={index}
                      role="option"
                      tabIndex={0}
                      className="dropdown-item"
                      onClick={() => handleSelect('city', city)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleSelect('city', city);
                        }
                      }}
                    >
                      {city}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="trip-form-row">
            <label htmlFor="startDate" className="trip-form-label">
              Trip Start Date and Time
            </label>
            <input
              className="trip-form-input"
              id="startDate"
              type="datetime-local"
              name="tripDate.startDate"
              value={trip.tripDate.startDate || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div className="trip-form-row">
            <label htmlFor="endDate" className="trip-form-label">
              Trip End Date and Time
            </label>
            <input
              className="trip-form-input"
              id="endDate"
              type="datetime-local"
              name="tripDate.endDate"
              value={trip.tripDate.endDate || ''}
              onChange={handleChange}
              required
            />
            <AlertMessage message={getAlert('tripDate')} />
          </div>

          {/* totalDays user override */}
          <div className="trip-form-row">
            <label htmlFor="totalDays" className="trip-form-label">
              Total Traktamente Day(s)
            </label>
            <input
              id="totalDays"
              type="number"
              name="calculatedData.totalDays"
              step="0.5"
              min="0"
              value={trip.calculatedData?.totalDays ?? ''}
              onChange={handleChange}
              className="trip-form-input"
            />
            <AlertMessage message={getAlert('hotelBreakfastDays')} />
          </div>

          {/* Breakfast & Mileage */}
          <div className="trip-form-row">
            <label htmlFor="breakfastDays" className="trip-form-label">
              No. of Hotel Breakfast (days)
            </label>
            <input
              className="trip-form-input"
              id="breakfastDays"
              type="number"
              name="hotelBreakfastDays"
              value={trip.hotelBreakfastDays || 0}
              onChange={handleChange}
              min="0"
            />
          </div>
          <div className="trip-form-row">
            <label htmlFor="mileage" className="trip-form-label">
              Driving Mil with Private Car (mil)
            </label>
            <input
              className="trip-form-input"
              id="mileage"
              type="number"
              name="mileageKm"
              value={trip.mileageKm || 0}
              onChange={handleChange}
              min="0"
            />
          </div>

          <hr className="trip-form-divider" />

          {/* Summary */}
          <div className="trip-form-row">
            <p className="trip-form-label">Total Traktamente Day(s)</p>
            <p className="trip-form-value total-value">
              {trip.calculatedData?.totalDays || 0} day(s)
            </p>
          </div>

          {isAdmin() && (
            <>
              <div className="trip-form-row">
                <p className="trip-form-label total-label">Total Amount</p>
                <p className="total-value">
                  {trip.calculatedData?.totalAmount || 0} SEK
                </p>
              </div>

              <div className="trip-form-row">
                <p className="trip-form-label">Calculation Formula:</p>
                <p className="trip-form-note">
                  {trip.calculatedData?.totalDays === 0
                    ? 'Total Amount = 0 kr (since total days is 0).'
                    : `Total Amount = (${trip.calculatedData?.totalDays} days ×
                     ${trip.calculatedData?.standardAmount || 'N/A'} kr)
                     - (${trip.hotelBreakfastDays} × 58 kr)
                     + (${trip.mileageKm} × 25 kr)`}
                </p>
              </div>

              {/* Final Amount Option */}
              <hr className="trip-form-divider" />
              <div className="trip-form-row">
                <p className="trip-form-label">Final Amount Option</p>
                <div>
                  <button
                    type="button"
                    className={`percentage-btn ${
                      ratio === 0.5 ? 'active' : ''
                    }`}
                    onClick={() => handleFinalAmountChange(0.5)}
                  >
                    50%
                  </button>

                  <button
                    type="button"
                    className={`percentage-btn ${
                      ratio === 0.75 ? 'active' : ''
                    }`}
                    onClick={() => handleFinalAmountChange(0.75)}
                  >
                    75%
                  </button>

                  <button
                    type="button"
                    className={`percentage-btn ${ratio === 1 ? 'active' : ''}`}
                    onClick={() => handleFinalAmountChange(1)}
                  >
                    100%
                  </button>
                </div>
              </div>
              <div className="trip-form-row">
                <p className="trip-form-label total-label">Final Amount</p>
                <p className="total-value">
                  {trip.calculatedData?.finalAmount || 0} SEK
                </p>
              </div>
            </>
          )}

          <hr className="trip-form-divider" />

          {/* Status if editing */}
          {mode === 'edit' && (
            <div className="trip-form-row">
              <p className="trip-form-label">Status:</p>
              <p className={`trip-form-status ${trip?.status?.toLowerCase()}`}>
                {trip.status
                  ? trip.status.charAt(0).toUpperCase() + trip.status.slice(1)
                  : 'N/A'}
              </p>
            </div>
          )}

          {mode === 'edit' && isAdmin() && (
            <>
              <div className="trip-form-row">
                <p className="trip-form-label">Trip Created By</p>
                <p className="trip-form-value">
                  {trip.creation?.createdBy || 'N/A'}
                </p>
              </div>

              <div className="trip-form-row">
                <p className="trip-form-label">Approved By</p>
                <p className="trip-form-value">
                  {trip.submission?.approvedBy
                    ? `${trip.submission.approvedBy.firstName} ${trip.submission.approvedBy.lastName}`
                    : 'N/A'}
                </p>
              </div>
            </>
          )}
        </div>

        <TripFormButtons
          onSave={null}
          onCancel={() =>
            mode === 'create'
              ? navigate('/dashboard')
              : navigate(`/trip/${tripId}`)
          }
          disabledSave={
            !isFormValid() ||
            hasActiveAlerts() ||
            (mode === 'edit' && !isModified())
          }
        />
      </form>
    </div>
  );
}
