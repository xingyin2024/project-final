import { useState, useEffect } from "react";
import countriesData from "../assets/traktamente-en.json";
import favoriteCities from "../assets/fav-city.json";

const useTripForm = (initialFormData, setAlert, clearAlert) => {
  const [formData, setFormData] = useState(initialFormData);
  const [dropdownState, setDropdownState] = useState({ country: false, city: false });
  const [countrySuggestions, setCountrySuggestions] = useState([]);
  const [citySuggestions, setCitySuggestions] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Logic to handle start/end date adjustment
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
            endDate: newEndDate.toISOString().slice(0, 16),
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          tripDate: { ...prev.tripDate, startDate: value },
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, [key]: value },
    }));

    if (key === "country") {
      const matches = countriesData.filter((item) =>
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

  const validateCountry = (inputValue) => {
    const trimmedCountry = inputValue?.trim().toLowerCase();
    const isValid = countriesData.some(
      (item) => item["country or territory"].toLowerCase() === trimmedCountry
    );

    if (!trimmedCountry) setAlert("country", "Country field cannot be empty.");
    else if (!isValid) setAlert("country", "No matched country found, please check your location.");
    else clearAlert("country");
  };

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

  const toggleDropdown = (key) => {
    setDropdownState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const calculateDaysAndAmount = () => {
    if (!formData.tripDate.startDate || !formData.tripDate.endDate) return;

    const startDate = new Date(formData.tripDate.startDate);
    const endDate = new Date(formData.tripDate.endDate);
    let totalDays = 0;

    totalDays += startDate.getHours() >= 12 ? 0.5 : 1;
    totalDays += endDate.getHours() < 12 ? 0.5 : 1;

    const fullDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
    if (fullDays > 0) totalDays += fullDays - 1;

    const tripYear = startDate.getFullYear();
    const countryData = countriesData.find(
      (item) =>
        item["country or territory"] === formData.location.country &&
        item.year === String(tripYear)
    );

    const standardAmount = countryData ? parseFloat(countryData["standard amount"]) : 0;
    const totalAmount =
      totalDays * standardAmount - formData.hotelBreakfastDays * 52 + formData.mileageKm * 25;

    setFormData((prev) => ({
      ...prev,
      calculatedData: { totalDays, totalAmount, standardAmount },
    }));
  };

  useEffect(() => {
    calculateDaysAndAmount();
  }, [formData?.tripDate, formData?.hotelBreakfastDays, formData?.mileageKm]);

  return {
    formData,
    setFormData,
    handleChange,
    handleInputChange,
    validateCountry,
    handleSelect,
    toggleDropdown,
    dropdownState,
    countrySuggestions,
    citySuggestions,
  };
};

export default useTripForm;
