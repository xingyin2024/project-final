import PropTypes from "prop-types";
import { createContext, useContext, useState, useEffect } from "react";

// Retrieve BASE_URL from environment variables
const BASE_URL = import.meta.env.VITE_BASE_URL; // For Vite-based projects

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false); // Handles animation for loading
  const [error, setError] = useState(null); // Handles error messages

  // Load user from localStorage on initial render
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user"); // Save full user details
    if (storedToken && storedUser) {
      setUser(JSON.parse(storedUser)); // Parse and set the full user object
    }
  }, []);

  // Centralized function to handle requests with loading and error state
  const handleRequestWithLoading = async (callback) => {
    setLoading(true); // Start loading
    setError(null); // Clear previous errors
    
    try {
      await callback(); // Execute the provided callback
    } catch (err) {
      // Log error and set user-friendly message
      console.error("Error occurred:", err);
      setError(
        err.response?.message || err.message || "An unexpected error occurred."
      );
      throw err; // Rethrow error for calling functions to handle
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const register = async (formData) => {
    return handleRequestWithLoading(async () => {
      const response = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      setUser(data.user);
      localStorage.setItem("accessToken", data.data.accessToken);
    });
  };

  const login = async (credentials) => {
    return handleRequestWithLoading(async () => {
      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      setUser(data.data);
      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.data)); // Save full user data
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user"); // Clear user details
  };

  // Check if the user is an admin
  const isAdmin = () => user?.role === "admin";

  return (
    <UserContext.Provider
      value={{
        user,
        register,
        login,
        logout,
        isAdmin,
        loading,
        error,
        setError, 
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for using UserContext
export const useUser = () => useContext(UserContext);

export default UserContext;

UserProvider.propTypes = {
  children: PropTypes.any,
};
