import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import countriesData from '../assets/traktamente-en.json';
import favoriteCities from '../assets/fav-city.json';
import useUniqueCountries from '../hooks/useUniqueCountries';
import useAlert from '../hooks/useAlert';
import TripFormHeader from '../components/TripFormHeader';
import TripForm from '../components/TripForm';
import TripDayCalculator from '../components/TripDayCalculator';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const EditTrip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const sortedCountries = useUniqueCountries();

  // State for managing form data, dropdowns, errors, and alerts
  // 1) Make sure location and tripDate have defaults
  const [formData, setFormData] = useState({
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
    totalDays: 0,
    calculatedData: {},
  });

  const [originalData, setOriginalData] = useState(null);
  const [dropdownState, setDropdownState] = useState({
    country: false,
    city: false,
  });
  const [countrySuggestions, setCountrySuggestions] = useState([]);
  const [citySuggestions, setCitySuggestions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { setAlert, clearAlert, getAlert } = useAlert();

  // 2) Called by TripDayCalculator to update totalDays
  const handleDaysCalculated = (autoDays) => {
    setFormData((prev) => {
      // If the new auto-calculated days is the same, do nothing.
      if (prev.totalDays === autoDays) {
        return prev;
      }

      // Overwrite the totalDays with auto-calculated
      return {
        ...prev,
        totalDays: autoDays,
        calculatedData: {
          ...prev.calculatedData,
          totalDays: autoDays,
        },
      };
    });
  };

  // Helper to format dates for datetime-local inputs
  const formatDateForInput = (date) =>
    new Date(date).toISOString().slice(0, 16);

  // 3) In the fetchTrip, also ensure you preserve the default shape
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await fetch(`${BASE_URL}/trips/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: accessToken,
          },
        });

        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || 'Failed to fetch trip details.');

        const formattedTripDate = {
          startDate: formatDateForInput(data.data.tripDate.startDate),
          endDate: formatDateForInput(data.data.tripDate.endDate),
        };

        // Take the backend's calculatedData.totalDays if present
        const initialDays = data.data.calculatedData?.totalDays ?? 0;

        setFormData({
          ...data.data,
          location: { ...data.data.location },
          tripDate: formattedTripDate,
          // Make sure the top-level totalDays is set from DB if available
          totalDays: initialDays,
          calculatedData: {
            ...data.data.calculatedData,
            totalDays: initialDays,
          },
        });

        setOriginalData({
          ...data.data,
          location: { ...data.data.location },
          tripDate: formattedTripDate,
          totalDays: initialDays,
          calculatedData: {
            ...data.data.calculatedData,
            totalDays: initialDays,
          },
        });
      } catch (err) {
        setError(err.message);
        setAlert('general', 'Error fetching trip details.');
      } finally {
        setLoading(false);
      }
    };

    if (state?.trip) {
      // If data is from routing state...
      const formattedTripDate = {
        startDate: formatDateForInput(state.trip.tripDate.startDate),
        endDate: formatDateForInput(state.trip.tripDate.endDate),
      };

      const initialDays = state.trip.calculatedData?.totalDays ?? 0;

      setFormData({
        ...state.trip,
        tripDate: formattedTripDate,
        location: { ...state.trip.location },
        totalDays: initialDays,
        calculatedData: {
          ...state.trip.calculatedData,
          totalDays: initialDays,
        },
      });

      setOriginalData({
        ...state.trip,
        tripDate: formattedTripDate,
        location: { ...state.trip.location },
        totalDays: initialDays,
        calculatedData: {
          ...state.trip.calculatedData,
          totalDays: initialDays,
        },
      });
      setLoading(false);
    } else {
      fetchTrip();
    }
  }, [id, state]);

  // Check if form data has been modified
  const isModified = () =>
    JSON.stringify(formData) !== JSON.stringify(originalData);

  // Check if there are any active alerts
  const hasActiveAlerts = () => {
    const alerts = getAlert() || {}; // Ensure `alerts` is always an object
    return !!Object.values(getAlert()).find((alert) => alert);
  };

  // 4) Recalculate total amount whenever relevant fields change
  // or if the user typed a new totalDays manually.
  const calculateDaysAndAmount = () => {
    // Use the totalDays from state which is set by handleDaysCalculated
    const {
      totalDays = 0,
      location = {},
      hotelBreakfastDays = 0,
      mileageKm = 0,
    } = formData;

    // (1) If totalDays is 0 -> totalAmount = 0 no matter what
    if (totalDays === 0) {
      setFormData((prev) => ({
        ...prev,
        calculatedData: {
          ...prev.calculatedData,
          totalDays: 0,
          totalAmount: 0,
          standardAmount: 0,
        },
      }));
      return;
    }

    // (2) Otherwise do the normal logic
    const { country } = location;

    // Validate hotelBreakfastDays
    if (hotelBreakfastDays > totalDays) {
      setAlert(
        'hotelBreakfastDays',
        'Hotel Breakfast Days cannot exceed the total trip days.'
      );
    } else {
      clearAlert('hotelBreakfastDays');
    }

    // Get standard amount for the country and year from JSON file
    const tripYear = new Date(formData.tripDate.startDate).getFullYear();
    const countryData = countriesData.find(
      (item) =>
        item['country or territory'] === country &&
        item.year === String(tripYear)
    );
    const standardAmount = countryData
      ? parseFloat(countryData['standard amount'])
      : 0;

    // Calculate total amount
    const totalAmount =
      totalDays * standardAmount - hotelBreakfastDays * 58 + mileageKm * 25;

    // Update your formData
    setFormData((prev) => ({
      ...prev,
      calculatedData: {
        ...prev.calculatedData,
        totalDays,
        totalAmount,
        standardAmount,
      },
    }));
  };

  // Validate country input
  const validateCountry = (inputValue = formData.location.country) => {
    const trimmedCountry = inputValue?.trim().toLowerCase();
    const isValid = sortedCountries.some(
      (item) => item['country or territory'].toLowerCase() === trimmedCountry
    );

    if (!trimmedCountry) setAlert('country', 'Country field cannot be empty.');
    else if (!isValid)
      setAlert(
        'country',
        'No matched country found, please check your location.'
      );
    else clearAlert('country');
  };

  // Validate date input and set an alert if end date < start date. Remove the old auto-fix logic.
  const validateTripDates = (startVal, endVal) => {
    const startDate = new Date(startVal);
    const endDate = new Date(endVal);

    if (endDate < startDate) {
      setAlert(
        'tripDate',
        'Trip End Date cannot be earlier than Start Date. Please adjust.'
      );
    } else {
      clearAlert('tripDate');
    }
  };

  // 5) Re-run calculation when relevant fields change
  useEffect(() => {
    if (
      formData?.tripDate?.startDate &&
      formData?.tripDate?.endDate &&
      formData?.location?.country
    ) {
      calculateDaysAndAmount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData?.tripDate?.startDate,
    formData?.tripDate?.endDate,
    formData?.hotelBreakfastDays,
    formData?.mileageKm,
    formData?.location?.country,
    formData.totalDays, // watch for manual changes
  ]);

  // Handle general input changes
  /**
   * Symmetrical date validation & auto-fix logic:
   * - If newStart > currentEnd => fix newStart = currentEnd - 1 day
   * - If newEnd < currentStart => fix newEnd = currentStart + 1 day
   * - Show an alert if we had to fix anything
   * - Otherwise clear that alert
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'tripDate.startDate') {
      const newStart = new Date(value);
      const currentEnd = new Date(formData.tripDate.endDate);

      if (newStart > currentEnd) {
        // Fix the START date to be 1 day before End Date
        const fixedStart = new Date(currentEnd);
        fixedStart.setDate(fixedStart.getDate() - 1);

        setFormData((prev) => ({
          ...prev,
          tripDate: {
            ...prev.tripDate,
            startDate: formatDateForInput(fixedStart),
            // keep endDate as is
            endDate: prev.tripDate.endDate,
          },
        }));

        setAlert(
          'tripDate',
          'Start Date was automatically adjusted to be before End Date.'
        );
      } else {
        // valid; no fix needed
        setFormData((prev) => ({
          ...prev,
          tripDate: {
            ...prev.tripDate,
            startDate: value,
          },
        }));
        clearAlert('tripDate');
      }
    } else if (name === 'tripDate.endDate') {
      const newEnd = new Date(value);
      const currentStart = new Date(formData.tripDate.startDate);

      if (newEnd < currentStart) {
        // Fix the END date to be 1 day after Start Date
        const fixedEnd = new Date(currentStart);
        fixedEnd.setDate(fixedEnd.getDate() + 1);

        setFormData((prev) => ({
          ...prev,
          tripDate: {
            ...prev.tripDate,
            startDate: prev.tripDate.startDate,
            endDate: formatDateForInput(fixedEnd),
          },
        }));

        setAlert(
          'tripDate',
          'End Date was automatically adjusted to be after Start Date.'
        );
      } else {
        setFormData((prev) => ({
          ...prev,
          tripDate: {
            ...prev.tripDate,
            endDate: value,
          },
        }));
        clearAlert('tripDate');
      }
    } else if (name.includes('location.')) {
      const [key, subKey] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [key]: { ...prev[key], [subKey]: value },
      }));
    } else if (name.includes('calculatedData.')) {
      // e.g. "calculatedData.totalDays"
      const [_, field] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        calculatedData: {
          ...prev.calculatedData,
          [field]: parseFloat(value) || 0,
        },
        // keep top-level totalDays in sync
        ...(field === 'totalDays'
          ? { totalDays: parseFloat(value) || 0 }
          : null),
      }));
    } else {
      // other fields (title, hotelBreakfastDays, mileageKm, etc.)
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle input changes and validate country input
  const handleInputChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, [key]: value },
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

  // Handle dropdown selection and reset suggestions
  const handleSelect = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, [key]: value.trim() },
    }));
    setDropdownState((prev) => ({ ...prev, [key]: false }));

    if (key === 'country') {
      setCountrySuggestions([]);
      validateCountry(value.trim());
    }
    if (key === 'city') setCitySuggestions([]);
  };

  // Toggle dropdown visibility
  const toggleDropdown = (key) => {
    setDropdownState((prev) => ({ ...prev, [key]: !prev[key] }));

    // Reset suggestions if the dropdown is opened without typing
    if (key === 'country' && !dropdownState.country) {
      setCountrySuggestions(sortedCountries);
    } // Show all countries
    if (key === 'city' && !dropdownState.city) {
      setCitySuggestions(favoriteCities);
    } // Show all cities
  };

  // Handle save button click with form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isModified()) return;

    setLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`${BASE_URL}/trips/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: accessToken,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update trip.');
      }

      // Redirect to the TripDetail page on success
      navigate(`/trip/${id}`, { state: { updated: true } });
    } catch (err) {
      setError(err.message);
      setAlert('general', 'Error updating trip details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading trip details...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="trip-form-container">
      <TripFormHeader title="Edit Trip" />

      {/*
        Integrate the TripDayCalculator here.
        - Pass the start and end date from formData
        - Pass the handleDaysCalculated callback
      */}
      <TripDayCalculator
        startDateTime={formData.tripDate?.startDate}
        endDateTime={formData.tripDate?.endDate}
        onDaysCalculated={handleDaysCalculated}
      />

      <TripForm
        formData={formData}
        handleChange={handleChange}
        handleInputChange={handleInputChange}
        validateCountry={validateCountry}
        toggleDropdown={toggleDropdown}
        dropdownState={dropdownState}
        countrySuggestions={countrySuggestions}
        citySuggestions={citySuggestions}
        handleSelect={handleSelect}
        getAlert={getAlert}
        onSubmit={handleSubmit}
        isModified={isModified()}
        hasActiveAlerts={hasActiveAlerts()}
        includeStatus={true}
        navigate={navigate} // Pass navigate
        id={id} // Pass id for use in navigation
      />
    </div>
  );
};

export default EditTrip;
