import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import countriesData from '../assets/traktamente-en.json';
import favoriteCities from '../assets/fav-city.json';
import useUniqueCountries from '../hooks/useUniqueCountries';
import useAlert from '../hooks/useAlert';
import TripFormHeader from '../components/TripFormHeader';
import TripForm from '../components/TripForm';
import TripDayCalculator from '../components/TripDayCalculator';

// We'll import a common symmetricalDateFix if we create one. For now, we just inline it.

const BASE_URL = import.meta.env.VITE_BASE_URL;

const CreateTrip = () => {
  const navigate = useNavigate();
  const sortedCountries = useUniqueCountries();

  // ----------------------------------------------------------------
  // 1) Default formData shape
  // ----------------------------------------------------------------
  const [formData, setFormData] = useState({
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
    totalDays: 0, // top-level days
    calculatedData: {}, // store totalDays, totalAmount, standardAmount
  });

  // For country/city dropdowns
  const [dropdownState, setDropdownState] = useState({
    country: false,
    city: false,
  });
  const [countrySuggestions, setCountrySuggestions] = useState([]);
  const [citySuggestions, setCitySuggestions] = useState([]);

  // Loading & error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Alerts
  const { setAlert, clearAlert, getAlert } = useAlert();

  // Manual override logic
  const [manualOverride, setManualOverride] = useState(false);

  // ----------------------------------------------------------------
  // 2) TripDayCalculator calls this to set days, with guard
  // ----------------------------------------------------------------
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
  // 3) Calculate total amount & validate hotelBreakfast
  // ----------------------------------------------------------------
  const calculateDaysAndAmount = () => {
    const {
      totalDays = 0,
      location = {},
      hotelBreakfastDays = 0,
      mileageKm = 0,
    } = formData;

    // If 0 => zero everything
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

    // If breakfastDays > totalDays => alert
    if (hotelBreakfastDays > totalDays) {
      setAlert(
        'hotelBreakfastDays',
        'Hotel Breakfast Days cannot exceed the total trip days.'
      );
    } else {
      clearAlert('hotelBreakfastDays');
    }

    // find standardAmount
    const tripYear = new Date(formData.tripDate.startDate).getFullYear();
    const countryData = countriesData.find(
      (item) =>
        item['country or territory'] === location.country &&
        item.year === String(tripYear)
    );
    const standardAmount = countryData
      ? parseFloat(countryData['standard amount'])
      : 0;

    // compute
    const totalAmount =
      totalDays * standardAmount - hotelBreakfastDays * 58 + mileageKm * 25;

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

  // ----------------------------------------------------------------
  // 4) Re-run calculation when relevant fields change
  // ----------------------------------------------------------------
  useEffect(() => {
    if (
      formData.tripDate.startDate &&
      formData.tripDate.endDate &&
      formData.location.country
    ) {
      calculateDaysAndAmount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData.tripDate.startDate,
    formData.tripDate.endDate,
    formData.hotelBreakfastDays,
    formData.mileageKm,
    formData.location.country,
    formData.totalDays,
  ]);

  // ----------------------------------------------------------------
  // 5) Symmetrical date auto-fix logic in handleChange
  // ----------------------------------------------------------------
  const formatDateForInput = (date) =>
    new Date(date).toISOString().slice(0, 16);

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
        // fix newStart = end - 1 day
        const fixedStart = new Date(currentEnd);
        fixedStart.setDate(fixedStart.getDate() - 1);

        setFormData((prev) => ({
          ...prev,
          tripDate: {
            ...prev.tripDate,
            startDate: formatDateForInput(fixedStart),
          },
        }));
        setAlert('tripDate', 'Start Date was adjusted to be before End Date.');
      } else {
        // just set the new start
        setFormData((prev) => ({
          ...prev,
          tripDate: { ...prev.tripDate, startDate: value },
        }));
        clearAlert('tripDate');
      }
    } else if (name === 'tripDate.endDate') {
      const newEnd = new Date(value);
      const currentStart = new Date(formData.tripDate.startDate);

      if (newEnd < currentStart) {
        // fix end = start + 1 day
        const fixedEnd = new Date(currentStart);
        fixedEnd.setDate(fixedEnd.getDate() + 1);

        setFormData((prev) => ({
          ...prev,
          tripDate: {
            ...prev.tripDate,
            endDate: formatDateForInput(fixedEnd),
          },
        }));
        setAlert('tripDate', 'End Date was adjusted to be after Start Date.');
      } else {
        setFormData((prev) => ({
          ...prev,
          tripDate: { ...prev.tripDate, endDate: value },
        }));
        clearAlert('tripDate');
      }
    } else if (name.includes('location.')) {
      // e.g. "location.country"
      const [_, field] = name.split('.');
      // if user typed totalDays => set manualOverride
      if (field === 'totalDays') {
        setManualOverride(true);
      }

      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [field]: value,
        },
      }));
    } else {
      // e.g. "title", "hotelBreakfastDays", "mileageKm"
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // ----------------------------------------------------------------
  // 6) handleInputChange for country/city
  // ----------------------------------------------------------------
  const validateCountry = (inputValue = formData.location.country) => {
    const trimmedCountry = inputValue.trim().toLowerCase();
    const isValid = sortedCountries.some(
      (item) => item['country or territory'].toLowerCase() === trimmedCountry
    );

    if (!trimmedCountry) {
      setAlert('country', 'Country field cannot be empty.');
    } else if (!isValid) {
      setAlert('country', 'No matched country found for that input.');
    } else {
      clearAlert('country');
    }
  };

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

  // handleSelect, toggleDropdown remain the same
  const handleSelect = (key, value) => {
    setFormData((prev) => ({
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

  // ----------------------------------------------------------------
  // 7) The Save button is disabled until required fields are filled
  //    e.g. title, location.country, tripDate.startDate, tripDate.endDate
  // ----------------------------------------------------------------
  const isFormValid = () => {
    if (!formData.title) return false;
    if (!formData.location.country) return false;
    if (!formData.tripDate.startDate) return false;
    if (!formData.tripDate.endDate) return false;
    return true;
  };

  // ----------------------------------------------------------------
  // 8) handleSubmit -> POST to backend
  // ----------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      return; // do nothing if form isn't valid
    }

    setLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`${BASE_URL}/trips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: accessToken,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create trip.');
      }

      navigate('/dashboard', { state: { created: true } });
    } catch (err) {
      setError(err.message);
      setAlert('general', 'Error creating trip.');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------------
  // 9) Render
  // ----------------------------------------------------------------
  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="trip-form-container">
      {/* 
        (a) We can pass a prop to TripFormHeader for a custom back button behavior.
        For now, let's just go to /dashboard if user clicks back
      */}
      <TripFormHeader
        title="Create Trip Report"
        customBack={() => navigate('/dashboard')}
      />

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
        isModified={isFormValid()} // isModified => we pass isFormValid
        hasActiveAlerts={!!Object.values(getAlert() || {}).length} // disable if there's any active alert or form not valid
      />
    </div>
  );
};

export default CreateTrip;
