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

  // ----------------------------------------------------------------
  // 1) Default formData shape
  // ----------------------------------------------------------------
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
    totalDays: 0, // top-level days
    calculatedData: {}, // store totalDays, totalAmount, standardAmount
  });

  const [originalData, setOriginalData] = useState(null);

  // For country/city dropdowns
  const [dropdownState, setDropdownState] = useState({
    country: false,
    city: false,
  });
  const [countrySuggestions, setCountrySuggestions] = useState([]);
  const [citySuggestions, setCitySuggestions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ----------------------------------------------------------------
  // 2) Alert usage
  // ----------------------------------------------------------------
  const { setAlert, clearAlert, getAlert } = useAlert();

  // 3) Manual override logic
  //    - If user types totalDays by hand, we set manualOverride = true
  //    - Then TripDayCalculator won't overwrite it
  //    - We can reset manualOverride when user changes trip date
  // ----------------------------------------------------------------
  const [manualOverride, setManualOverride] = useState(false);

  /**
   * TripDayCalculator calls this. We only apply
   * the autoDays if manualOverride is false.
   */
  const handleDaysCalculated = (autoDays) => {
    setFormData((prev) => {
      // If user manually typed a day count, skip auto-calc
      if (manualOverride) {
        return prev;
      }
      // If it’s the same as current totalDays, do nothing
      if (prev.totalDays === autoDays) {
        return prev;
      }
      // Otherwise update
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

  // ----------------------------------------------------------------
  // 4.1) Helper to format date for datetime-local
  // ----------------------------------------------------------------
  const formatDateForInput = (date) =>
    new Date(date).toISOString().slice(0, 16);

  // ----------------------------------------------------------------
  // 4.1) Helper function to unify setting form data from any "trip" source
  // ----------------------------------------------------------------
  const applyTripData = (trip) => {
    const formattedTripDate = {
      startDate: formatDateForInput(trip.tripDate.startDate),
      endDate: formatDateForInput(trip.tripDate.endDate),
    };
    const initialDays = trip.calculatedData?.totalDays ?? 0;

    return {
      ...trip,
      location: { ...trip.location },
      tripDate: formattedTripDate,
      totalDays: initialDays,
      calculatedData: {
        ...trip.calculatedData,
        totalDays: initialDays,
      },
    };
  };

  // ----------------------------------------------------------------
  // 5) useEffect to load data from either state.trip or fetch
  // ----------------------------------------------------------------
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
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch trip details.');
        }

        // transform the fetched trip the same way
        const fromFetch = applyTripData(data.data);
        setFormData(fromFetch);
        setOriginalData(fromFetch);
      } catch (err) {
        setError(err.message);
        setAlert('general', 'Error fetching trip details.');
      } finally {
        setLoading(false);
      }
    };

    // If we have trip data from state, skip fetch
    if (state?.trip) {
      const fromState = applyTripData(state.trip);
      setFormData(fromState);
      setOriginalData(fromState);
      setLoading(false);
    } else {
      fetchTrip();
    }
  }, [id, state]);

  // ----------------------------------------------------------------
  // 6) isModified:Check if form data has been modified
  // + hasActiveAlerts: Check if there are any active alerts
  // ----------------------------------------------------------------
  const isModified = () =>
    JSON.stringify(formData) !== JSON.stringify(originalData);

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

  // ----------------------------------------------------------------
  // 8) Re-run calculation on relevant changes
  // ----------------------------------------------------------------
  useEffect(() => {
    if (
      formData?.tripDate?.startDate &&
      formData?.tripDate?.endDate &&
      formData?.location?.country
    ) {
      calculateDaysAndAmount();
    }
  }, [
    formData?.tripDate?.startDate,
    formData?.tripDate?.endDate,
    formData?.hotelBreakfastDays,
    formData?.mileageKm,
    formData?.location?.country,
    formData.totalDays, // watch for manual changes
  ]);

  // ----------------------------------------------------------------
  // 9) Symmetrical date auto-fix logic in handleChange
  // ----------------------------------------------------------------
  /**
   * Symmetrical date validation & auto-fix logic:
   * - If newStart > currentEnd => fix newStart = currentEnd - 1 day
   * - If newEnd < currentStart => fix newEnd = currentStart + 1 day
   * - Show an alert if we had to fix anything
   * - Otherwise clear that alert
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    // If user modifies the date => auto-calc can run again
    if (name === 'tripDate.startDate' || name === 'tripDate.endDate') {
      // reset manual override => if user changes date, we
      // allow autoDays to overwrite again
      setManualOverride(false);
    }

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
      // if user typed totalDays => set manualOverride
      if (field === 'totalDays') {
        setManualOverride(true);
      }

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

  // ----------------------------------------------------------------
  // 10) handleInputChange for location search and validate country input
  // ----------------------------------------------------------------
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

  // ----------------------------------------------------------------
  // 11) handleSelect for dropdown and reset suggestions
  // ----------------------------------------------------------------
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

  // ----------------------------------------------------------------
  // 12) toggleDropdown visibility
  // ----------------------------------------------------------------
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

  // ----------------------------------------------------------------
  // 13) onSubmit: Save button click with form submission
  // ----------------------------------------------------------------
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

  // ----------------------------------------------------------------
  // 14) Render
  // ----------------------------------------------------------------
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
