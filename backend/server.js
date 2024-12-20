import PropTypes from "prop-types";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const UserContext = createContext();

// Define roles as constants to avoid hardcoding strings
const ROLES = {
  ADMIN: "admin",
  COWORKER: "co-worker",
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // User information
  const [isLoggedIn, setIsLoggedIn] = useState(false); // User login status
  const [authenticated, setAuthenticated] = useState({
    accessToken: localStorage.getItem("accessToken"),
    auth: false,
  }); // Authentication state
  const [loading, setLoading] = useState(false); // Loading state for async actions
  const [error, setError] = useState(null); // Error state for handling errors gracefully

  const navigate = useNavigate();
  const apiUrl = import.meta.env.BASE_URL || "http://localhost:8080"; // API base URL

  // Load user details from localStorage on component mount
  useEffect(() => {
    const firstName = localStorage.getItem("firstName");
    if (firstName) {
      setUser({ firstName });
    }
  }, []);

  // Generalized API request function to avoid redundancy
  const apiRequest = async (endpoint, options) => {
    try {
      const response = await fetch(`${apiUrl}/${endpoint}`, options);
      if (!response.ok) {
        throw new Error("API request failed");
      }
      return await response.json();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // Handle user login
  const login = async (loginData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest("login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      if (data.notFound) {
        throw new Error("Invalid username or password");
      }

      // Store user details and authentication state
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("firstName", data.firstName);
      setAuthenticated({
        accessToken: data.accessToken,
        auth: true,
      });
      setUser({
        firstName: data.firstName,
        username: data.username,
        email: data.email,
        role: data.role,
      });
      setIsLoggedIn(true);

      // Navigate based on user role
      if (data.role === ROLES.ADMIN) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle user logout
  const signout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("firstName");
    setIsLoggedIn(false);
    setAuthenticated({ accessToken: null, auth: false });
    setUser(null);
    navigate("/");
  };

  // Handle user registration
  const registerUser = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest("register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      // Store user details and authentication state
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("firstName", data.firstName);
      setAuthenticated({
        accessToken: data.accessToken,
        auth: true,
      });
      setUser({
        firstName: data.firstName,
        username: userData.username,
        email: userData.email,
        role: userData.role,
      });
      setIsLoggedIn(true);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch trips for authenticated user
  const fetchTrips = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest("trips", {
        headers: {
          Authorization: localStorage.getItem("accessToken"),
        },
      });
      return data;
    } catch (err) {
      setError(err.message);
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isLoggedIn,
        setIsLoggedIn,
        authenticated,
        login,
        signout,
        registerUser,
        fetchTrips,
        loading,
        error,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

UserProvider.propTypes = {
  children: PropTypes.any,
};
