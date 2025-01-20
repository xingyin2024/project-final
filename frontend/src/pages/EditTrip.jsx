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

  // ----------------------------------------------------------------
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
  // 4) Helper to format date for datetime-local
  // ----------------------------------------------------------------
  const formatDateForInput = (date) =>
    new Date(date).toISOString().slice(0, 16);

  // ----------------------------------------------------------------
  // 5) Fetch or use state.trip
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

      setLoading(false); // make sure loading is off here
    } else {
      fetchTrip();
    }
  }, [id, state]);

  // ----------------------------------------------------------------
  // 6) isModified + hasActiveAlerts to check if anything changed and if there are active alerts
  // ----------------------------------------------------------------
  const isModified = () => {
    JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  const hasActiveAlerts = () => {
    const alerts = getAlert() || {}; // Ensure `alerts` is always an object
    return !!Object.values(getAlert()).find((alert) => alert);
  };

  // ----------------------------------------------------------------
  // 7) Calculation logic with a "guard" to avoid re-assigning
  //    the same numeric values
  // ----------------------------------------------------------------
  const calculateDaysAndAmount = () => {
    // Use the totalDays from state which is set by handleDaysCalculated
    const {
      totalDays = 0,
      location = {},
      hotelBreakfastDays = 0,
      mileageKm = 0,
    } = formData;

    // If totalDays=0 => total=0
    if (totalDays === 0) {
      setFormData((prev) => {
        // Check if these fields are already 0
        const alreadyZero =
          prev.calculatedData.totalDays === 0 &&
          (prev.calculatedData.totalAmount ?? 0) === 0 &&
          (prev.calculatedData.standardAmount ?? 0) === 0;
        if (alreadyZero) {
          return prev; // no changes
        }
        // else update to zeros
        return {
          ...prev,
          calculatedData: {
            ...prev.calculatedData,
            totalDays: 0,
            totalAmount: 0,
            standardAmount: 0,
          },
        };
      });
      return;
    }

    // Validate hotelBreakfastDays <= totalDays
    if (hotelBreakfastDays > totalDays) {
      setAlert(
        'hotelBreakfastDays',
        'Hotel Breakfast Days cannot exceed the total trip days.'
      );
    } else {
      clearAlert('hotelBreakfastDays');
    }

    const tripYear = new Date(formData.tripDate.startDate).getFullYear();
    const countryData = countriesData.find(
      (item) =>
        item['country or territory'] === location.country &&
        item.year === String(tripYear)
    );
    const standardAmount = countryData
      ? parseFloat(countryData['standard amount'])
      : 0;

    // (days * standard) - (breakfastDays * 58) + (mileageKm * 25)
    const newTotalAmount =
      totalDays * standardAmount - hotelBreakfastDays * 58 + mileageKm * 25;

    // guard: only set state if there's a change
    setFormData((prev) => {
      const oldCalc = prev.calculatedData || {};
      const oldStandard = oldCalc.standardAmount ?? 0;
      const oldAmount = oldCalc.totalAmount ?? 0;

      const noChange =
        oldCalc.totalDays === totalDays &&
        oldStandard === standardAmount &&
        oldAmount === newTotalAmount;

      if (noChange) {
        return prev; // do nothing
      }

      return {
        ...prev,
        calculatedData: {
          ...prev.calculatedData,
          totalDays,
          standardAmount,
          totalAmount: newTotalAmount,
        },
      };
    });
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
    formData.totalDays, // also re-calc if user typed new day count
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
  // 12) toggleDropdown visibility and reset suggestions
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
  // 13) onSubmit: Save button onclick with form submission
  // ----------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isModified()) return; // no changes => do nothing

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

      // success => go detail page
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
        Provide auto-calc for partial days, skipping if user overrode.
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
