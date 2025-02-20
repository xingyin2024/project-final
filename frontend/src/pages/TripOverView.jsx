import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import TripCard from '../components/TripCard';
import Pagination from '../components/Pagination';
import TripFormHeader from '../components/TripFormHeader';
import NoTripsFound from '../components/NoTripsFound';
import '../styles/tripOverview.css';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const TripOverView = () => {
  const { user } = useUser(); // Access logged-in user details
  const { state } = useLocation();
  const navigate = useNavigate();
  const filter = state?.filter || 'all';
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // For pagination (client-side example)
  const [currentPage, setCurrentPage] = useState(1);
  const tripsPerPage = 10;

  // Define a mapping of filter values to titles
  const filterTitles = {
    notSubmitted: `${trips.length} Trips Not Submitted`,
    submitted: `${trips.length} Trips Submitted`,
    all: `${trips.length} Trips in Total`,
  };

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          throw new Error('Unauthorized: No access token found.');
        }
        // Fetch trips from backend. You may include filter parameters if supported.
        const response = await fetch(`${BASE_URL}/trips`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: accessToken,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch trips.');
        }
        const data = await response.json();
        let fetchedTrips = data.data;

        // Filter trips based on the filter value
        if (filter === 'notSubmitted') {
          fetchedTrips = fetchedTrips.filter(
            (trip) => trip.status.toLowerCase() === 'not submitted'
          );
        } else if (filter === 'submitted') {
          fetchedTrips = fetchedTrips.filter((trip) =>
            ['approved', 'awaiting approval'].includes(
              trip.status.toLowerCase()
            )
          );
        }
        // For "all", no filter is applied.

        // Sort trips in descending order based on updated/created date if available.
        // Adjust the sorting field as needed.
        fetchedTrips.sort((a, b) => {
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

        setTrips(fetchedTrips);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [filter]);

  // Pagination calculations
  const indexOfLastTrip = currentPage * tripsPerPage;
  const indexOfFirstTrip = indexOfLastTrip - tripsPerPage;
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

  return (
    <div className="trip-overview-container">
      <TripFormHeader
        title={filterTitles[filter] || 'Trips'}
        onBack={() => navigate('/dashboard')}
      />

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

          <div className="trip-overview-list">
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

export default TripOverView;
