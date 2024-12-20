import { useEffect, useState } from "react";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [trips, setTrips] = useState([]);

  const apiUrl = import.meta.env.BASE_URL || "http://localhost:8080"; // Define API base URL

  useEffect(() => {
    const getData = async () => {
      try {
        // Fetch users from API
        const userResponse = await fetch(`${apiUrl}/users`);
        if (!userResponse.ok) {
          throw new Error("Failed to fetch users");
        }
        const userData = await userResponse.json();

        // Fetch trips from API
        const tripResponse = await fetch(`${apiUrl}/trips`);
        if (!tripResponse.ok) {
          throw new Error("Failed to fetch trips");
        }
        const tripData = await tripResponse.json();

        // Update state
        setUsers(userData);
        setTrips(tripData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    getData();
  }, [apiUrl]);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div>
        <h2>Users</h2>
        <ul>
          {users.map((user) => (
            <li key={user.id}>{user.firstName} {user.lastName}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Trips</h2>
        <ul>
          {trips.map((trip) => (
            <li key={trip.id}>{trip.title} - {trip.location.city}, {trip.location.country}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Admin;