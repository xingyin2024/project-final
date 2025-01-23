import { Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Home from '../pages/Home';
import About from '../pages/About';
import Contact from '../pages/Contact';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import CreateTrip from '../pages/CreateTrip';
import TripDetail from '../pages/TripDetail';
import EditTrip from '../pages/EditTrip';
import Profile from '../pages/Profile';
import Admin from '../pages/Admin';
import NotFound from '../pages/NotFound';
import TripOverView from '../pages/TripOverView';

const AppRoutes = () => {
  const { user, isAdmin, authLoading } = useUser();

  // Show a loading indicator while authentication is being determined
  if (authLoading) {
    return <p>Loading...</p>; // Replace with a spinner or styled loading component
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={user ? <Dashboard /> : <Navigate to="/" />}
      />
      <Route
        path="/create-trip"
        element={user ? <CreateTrip /> : <Navigate to="/" />}
      />
      <Route
        path="/trip/:id"
        element={user ? <TripDetail /> : <Navigate to="/" />}
      />
      <Route
        path="/create-trip"
        element={user ? <CreateTrip /> : <Navigate to="/" />}
      />
      <Route
        path="/edit-trip/:id"
        element={user ? <EditTrip /> : <Navigate to="/" />}
      />
      <Route
        path="/tripoverview"
        element={user ? <TripOverView /> : <Navigate to="/" />}
      />
      <Route
        path="/profile/:id"
        element={user ? <Profile /> : <Navigate to="/" />}
      />

      {/* Admin Route */}
      <Route
        path="/admin"
        element={isAdmin() ? <Admin /> : <Navigate to="/dashboard" />}
      />

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
