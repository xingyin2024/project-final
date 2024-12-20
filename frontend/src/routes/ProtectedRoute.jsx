import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const ProtectedRoute = ({ children, role }) => {
  const { user, isLoggedIn } = useUser();

  // If the user is not logged in, redirect to the welcome page
  if (!isLoggedIn) {
    console.warn("Access denied: User not logged in");
    return <Navigate to="/" />;
  }

  // If a specific role is required but does not match the user's role, redirect to the dashboard
  if (role && user.role !== role) {
    console.warn(`Access denied: User role '${user.role}' does not match required role '${role}'`);
    return <Navigate to="/dashboard" />;
  }

  // If all checks pass, render the child component
  return children;
};

export default ProtectedRoute
