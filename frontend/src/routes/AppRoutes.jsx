import { Route } from "react-router-dom";
import Welcome from "../pages/Welcome";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import CreateTrip from "../pages/CreateTrip";
import EditTrip from "../pages/EditTrip";
import TripDetail from "../pages/TripDetail";
import Admin from "../pages/Admin";
import Settings from "../pages/Settings";
import ProtectedRoute from "../components/ProtectedRoute";

const AppRoutes = (
  <>
    {/* Public Routes */}
    <Route path="/" element={<Welcome />} />
    <Route
      path="/login"
      element={<Login />} />
    <Route
      path="/register"
      element={<Register />} />

    {/* Protected Routes */}
    <Route
      path="/dashboard"
      element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route
      path="/create-trip"
      element={<ProtectedRoute><CreateTrip /></ProtectedRoute>} />
    <Route
      path="/edit-trip/:id"
      element={<ProtectedRoute><EditTrip /></ProtectedRoute>} />
    <Route
      path="/trip/:id"
      element={<ProtectedRoute><TripDetail /></ProtectedRoute>} />
    <Route
      path="/admin"
      element={<ProtectedRoute role="admin"><Admin /></ProtectedRoute>} />
    <Route
      path="/settings"
      element={<ProtectedRoute><Settings /></ProtectedRoute>} />

    {/* Fallback */}
    <Route
      path="*"
      element={<Login />} />
  </>
);

export default AppRoutes;
