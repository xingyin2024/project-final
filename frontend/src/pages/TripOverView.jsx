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

        // Sort trips (most recent first)
        fetchedTrips.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );

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
          <div className="trip-overview-list">
            {currentTrips.map((trip) => (
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
