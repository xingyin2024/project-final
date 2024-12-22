import { Route } from "react-router-dom";
import Welcome from "../pages/Welcome";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import CreateTrip from "../pages/CreateTrip";
import EditTrip from "../pages/EditTrip";
import TripDetail from "../pages/TripDetail";
import Admin from "../pages/Admin";
import Profile from "../pages/Profile";
import ProtectedRoute from "../routes/ProtectedRoute";
import NotFound from "../pages/NotFound";

const AppRoutes = (
  <>
    {/* Public Routes */}
    <Route path="/" element={<Welcome />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    {/* Protected Routes */}
    <Route
      path="/dashboard"
      element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route
      path="/create-trip"
      element={<ProtectedRoute><CreateTrip /></ProtectedRoute>} />
    <Route
      path="/trips/:id"
      element={<ProtectedRoute><EditTrip /></ProtectedRoute>} />
    <Route
      path="/trips/:id"
      element={<ProtectedRoute><TripDetail /></ProtectedRoute>} />
    <Route
      path="/admin"
      element={<ProtectedRoute role="admin"><Admin /></ProtectedRoute>} />
    <Route
      path="/profile"
      element={<ProtectedRoute><Profile /></ProtectedRoute>} />

    {/* Fallback */}
    <Route path="*" element={<NotFound />} />
  </>
);

export default AppRoutes;
