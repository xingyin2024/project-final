import PropTypes from 'prop-types';
import { createContext, useContext, useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_BASE_URL;
const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // Indicates authentication loading
  const [error, setError] = useState(null); // Handles error messages

  // Load user from localStorage on initial render
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setUser(JSON.parse(storedUser));
    }

    setAuthLoading(false); // Mark authentication check as complete
  }, []);

  const register = async (formData) => {
    setAuthLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed.');
      }

      setUser(data.data);
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.data));
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
      throw err; // Allow error handling in calling components
    } finally {
      setAuthLoading(false);
    }
  };

  const login = async (credentials) => {
    setAuthLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed.');
      }

      setUser(data.data);
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.data));
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
      throw err; // Allow error handling in calling components
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');

    navigate('/');
  };

  const isAdmin = () => user?.role === 'admin';

  return (
    <UserContext.Provider
      value={{
        user,
        authLoading,
        register,
        login,
        logout,
        isAdmin,
        error,
        setError,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

export default UserContext;

UserProvider.propTypes = {
  children: PropTypes.any,
};
