import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeamCard from '../components/TeamCard';
import '../styles/admin.css';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken)
          throw new Error('Unauthorized: No access token found.');

        const response = await fetch(`${BASE_URL}/users`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: accessToken,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch users.');
        }

        const data = await response.json();
        setUsers(data.data); // Adjust based on API response structure
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search query
  const filteredUsers = users.filter((user) =>
    [user.username, user.firstName, user.lastName, user.role]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) return <p>Loading users...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="admin-container">
      {/* Header */}
      <h1 className="admin-header">Admin Panel</h1>

      {/* Team Member List */}
      <div className="team-container">
        {/* Team Member Header */}
        <div className="team-header-container">
          <h2 className="team-header">Team Member</h2>
          <button
            className="text-btn"
            onClick={() => console.log('Add Team Member')}
          >
            Add Team Member
          </button>
        </div>

        {/* Search Input */}
        <div className="search-input">
          <input
            type="text"
            placeholder="Search by username, firstname, lastname, or role"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Team Member List using TeamCard */}
        <div className="team-list">
          {filteredUsers.map((user) => (
            <TeamCard
              key={user._id}
              user={user}
              onClick={() =>
                navigate(`/profile/${user._id}`, { state: { user } })
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin;
