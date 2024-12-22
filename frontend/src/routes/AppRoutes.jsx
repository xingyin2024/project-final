import { Route, Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import Welcome from "../pages/Welcome";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import CreateTrip from "../pages/CreateTrip";
import EditTrip from "../pages/EditTrip";
import TripDetail from "../pages/TripDetail";
import Admin from "../pages/Admin";
import Profile from "../pages/Profile";
import NotFound from "../pages/NotFound";


const AppRoutes = () => {
  const { user, isAdmin } = useUser();

  return (
    <>
      {/* Public Routes */}
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/create-trip" element={user ? <CreateTrip /> : <Navigate to="/login" />} />
      <Route path="/trips/:id" element={user ? <EditTrip /> : <Navigate to="/login" />} />
      <Route path="/trips/:id" element={user ? <TripDetail /> : <Navigate to="/login" />} />
      <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />

      {/* Admin Route */}
      <Route path="/admin" element={isAdmin() ? <Admin /> : <Navigate to="/dashboard" />} />

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </>
  );
};

export default AppRoutes;
