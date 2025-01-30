import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import TripCard from '../components/TripCard';
import SummaryCard from '../components/SummaryCard';
import Pagination from '../components/Pagination';
import NoTripsFound from '../components/NoTripsFound';
import '../styles/dashboard.css';

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Helper function from backend ref (if used client-side)
export const getPagination = (page = 1, limit = 10) => {
  const sanitizedPage = Math.max(1, Number(page) || 1);
  const sanitizedLimit = Math.min(100, Math.max(1, Number(limit) || 10));
  return { page: sanitizedPage, limit: sanitizedLimit };
};

const Dashboard = () => {
  const { user } = useUser(); // Access logged-in user details
  const [trips, setTrips] = useState([]);
  const [summary, setSummary] = useState({ submitted: 0, notSubmitted: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Client-side pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const tripsPerPage = 4;
  const navigate = useNavigate(); // Initialize navigate function

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);

        // Retrieve access token
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          throw new Error('Unauthorized: No access token found.');
        }

        // Fetch trips from backend
        const response = await fetch(`${BASE_URL}/trips`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: accessToken, // Use direct accessToken here
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch trips.');
        }

        const data = await response.json();

        let filteredTrips = [];
        if (user.role === 'admin') {
          // Admins see all trips
          filteredTrips = data.data;
        } else {
          // Regular users see only their trips
          filteredTrips = data.data.filter(
            (trip) => trip.userId?._id === user?.id
          );
        }

        // Sort trips in descending order based on updated/created date if available.
        // Adjust the sorting field as needed.
        filteredTrips.sort((a, b) => {
          // Check if updatedAt is null for either trip and use createdAt if necessary
          const updatedA = a.submission.updatedAt || a.creation.createdAt;
          const updatedB = b.submission.updatedAt || b.creation.createdAt;

          // If both updatedAt are not null, compare by updatedAt
          if (a.submission.updatedAt && b.submission.updatedAt) {
            return (
              new Date(b.submission.updatedAt) -
              new Date(a.submission.updatedAt)
            );
          }

          // If updatedAt is null for one or both trips, compare by createdAt
          return new Date(updatedB) - new Date(updatedA);
        });

        // Calculate summary
        const notSubmitted = filteredTrips.filter(
          (trip) => trip.status.toLowerCase() === 'not submitted'
        ).length;

        const submitted = filteredTrips.filter((trip) =>
          ['approved', 'awaiting approval'].includes(trip.status.toLowerCase())
        ).length;

        setTrips(filteredTrips);
        setSummary({ submitted, notSubmitted });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTrips();
    }
  }, [user]);

  // Get trips for current page
  const { page, limit } = getPagination(currentPage, tripsPerPage);
  const indexOfLastTrip = page * limit;
  const indexOfFirstTrip = indexOfLastTrip - limit;
  const currentTrips = trips.slice(indexOfFirstTrip, indexOfLastTrip);
  const totalPages = Math.ceil(trips.length / tripsPerPage);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter users based on search query
  const filteredTrips = currentTrips.filter((trip) => {
    const startYear = new Date(trip.tripDate.startDate)
      .getFullYear()
      .toString();
    return [
      trip.title,
      trip.location?.city,
      trip.location?.country,
      trip.status,
      trip.creation.createdBy,
      trip.submission.updatedBy,
      startYear,
    ]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  if (loading) {
    return <p>Loading trips...</p>;
  }

  if (error) {
    return <p className="error-message">Error: {error}</p>;
  }

  // Handlers for navigating to TripOverView with filters.
  const goToOverview = (filter) => {
    navigate('/tripoverview', { state: { filter } });
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <h1 className="dashboard-header">Hello, {user?.firstName || 'Guest'}!</h1>

      {/* Summary Cards (as buttons) */}
      <div className="summary-cards">
        <SummaryCard
          title="Not Submitted"
          value={summary.notSubmitted}
          label="trip report(s)"
          onClick={() => goToOverview('notSubmitted')}
        />
        <SummaryCard
          title="Submitted"
          value={summary.submitted}
          label="trip report(s)"
          onClick={() => goToOverview('submitted')}
        />
      </div>

      {/* Recent Trips Header */}
      <div className="recent-trips-header-container">
        <h2 className="recent-trips-header">Recent Trips</h2>
        <button className="text-btn" onClick={() => goToOverview('all')}>
          View All
        </button>
      </div>

      {trips.length === 0 ? (
        <NoTripsFound />
      ) : (
        <>
          {/* Search Input */}
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search trips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Existing UI for TripCard list and Pagination */}
          <div className="recent-trips-list">
            {filteredTrips.map((trip) => (
              <TripCard
                key={trip._id}
                trip={trip}
                userRole={user?.role}
                onClick={() =>
                  navigate(`/trip/${trip._id}`, { state: { trip } })
                }
              />
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
