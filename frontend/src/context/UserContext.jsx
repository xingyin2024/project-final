import { createContext, useContext, useState } from "react";

// Retrieve BASE_URL from environment variables
const BASE_URL = import.meta.env.VITE_BASE_URL; // For Vite-based projects

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const register = async (formData) => {
    try {
      const response = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem("accessToken", data.data.accessToken); // Save token in localStorage
      } else {
        throw new Error(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      throw error; // Rethrow error to handle in the registration form
    }
  };

  const login = async (credentials) => {
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      setUser(data.data); // Update the user state
      localStorage.setItem("accessToken", data.data.accessToken); // Save token in localStorage
    } catch (error) {
      console.error("Login failed:", error);
      throw error; // Rethrow the error for the login form to handle
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("accessToken");
  };

  // Check if the user is an admin
  const isAdmin = () => user?.role === "admin";

  return (
    <UserContext.Provider value={{ user, register, login, logout, isAdmin }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for using UserContext
export const useUser = () => useContext(UserContext);

export default UserContext;
