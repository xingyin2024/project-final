import { useState } from "react";

const useAlert = () => {
  const [alerts, setAlerts] = useState({}); // Store alert messages by field name

  // Set an alert for a specific field
  const setAlert = (field, message) => {
    setAlerts((prev) => ({ ...prev, [field]: message }));
  };

  // Clear an alert for a specific field
  const clearAlert = (field) => {
    setAlerts((prev) => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  // Retrieve the alert for a specific field
  const getAlert = (field) => alerts[field] || null;

  return { setAlert, clearAlert, getAlert };
};

export default useAlert;
