import { useEffect, useState } from "react";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [userPage, setUserPage] = useState(1);
  const [tripPage, setTripPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [tripTotalPages, setTripTotalPages] = useState(1);

  const apiUrl = import.meta.env.BASE_URL || "http://localhost:8080";

  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await fetch(`${apiUrl}/users?page=${userPage}&limit=10`);
        const data = await response.json();
        setUsers(data.data);
        setUserTotalPages(data.totalPages);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    const getTrips = async () => {
      try {
        const response = await fetch(`${apiUrl}/trips?page=${tripPage}&limit=10`);
        const data = await response.json();
        setTrips(data.data);
        setTripTotalPages(data.totalPages);
      } catch (error) {
        console.error("Error fetching trips:", error);
      }
    };

    getUsers();
    getTrips();
  }, [userPage, tripPage, apiUrl]);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div>
        <h2>Users</h2>
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              {user.firstName} {user.lastName}
            </li>
          ))}
        </ul>
        <div className="pagination">
          <button disabled={userPage === 1} onClick={() => setUserPage(userPage - 1)}>Previous</button>
          <span>Page {userPage} of {userTotalPages}</span>
          <button disabled={userPage === userTotalPages} onClick={() => setUserPage(userPage + 1)}>Next</button>
        </div>
      </div>
      <div>
        <h2>Trips</h2>
        <ul>
          {trips.map((trip) => (
            <li key={trip.id}>
              {trip.title} - {trip.location.city}, {trip.location.country}
            </li>
          ))}
        </ul>
        <div className="pagination">
          <button disabled={tripPage === 1} onClick={() => setTripPage(tripPage - 1)}>Previous</button>
          <span>Page {tripPage} of {tripTotalPages}</span>
          <button disabled={tripPage === tripTotalPages} onClick={() => setTripPage(tripPage + 1)}>Next</button>
        </div>
      </div>
    </div>
  );
};

export default Admin;
