import { useEffect, useState } from "react";
import { fetchMockData } from "../utils/fetchMockData"; // Import mock data fetcher

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const userData = await fetchMockData("user"); // Fetch users from user.json
      const tripData = await fetchMockData("trips"); // Fetch trips from trips.json
      setUsers(userData);
      setTrips(tripData);
    };

    getData();
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {/* Render users and trips */}
    </div>
  );
};

export default Admin;
