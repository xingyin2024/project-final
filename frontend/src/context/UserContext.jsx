import PropTypes from "prop-types";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); //Stores user details such as name and email; initially set to null.
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authenticated, setAuthenticated] = useState({
    accessToken: localStorage.getItem("accessToken"),
    auth: false,
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const apiUrl = import.meta.env.BASE_URL || "http://localhost:8080";

  useEffect(() => {
    const firstName = localStorage.getItem("firstName");
    if (firstName) {
      setUser({ firstName });
    }
  }, []);

  const login = async (loginData) => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();

      if (data.notFound) {
        throw new Error("Invalid username or password");
      }

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
      });

      setIsLoggedIn(true);
      setLoading(false);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setLoading(false);
      throw err;
    }
  };

  const signout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("firstName");

    setIsLoggedIn(false);
    setAuthenticated({
      accessToken: null,
      auth: false,
    });

    setUser(null);
    navigate("/");
  };

  const registerUser = async (userData) => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      const data = await response.json();

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
      });

      setIsLoggedIn(true);
      setLoading(false);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setLoading(false);
      throw err;
    }
  };

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/trips`, {
        headers: {
          Authorization: localStorage.getItem("accessToken"),
        },
      });

      if (!response.ok) {
        throw new Error("Unauthorized access to trips");
      }

      const data = await response.json();
      setLoading(false);
      return data;
    } catch (err) {
      console.error(err);
      setLoading(false);
      throw err;
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
