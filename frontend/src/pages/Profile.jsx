import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import ProfileForm from '../components/ProfileForm';
import ConfirmationPopup from '../components/ConfirmationPopup';
import ActionButton from '../components/ActionButton';
import '../styles/profile.css';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Profile = () => {
  const { id } = useParams();
  const { user, isAdmin } = useUser();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Popup state
  const [popupMessage, setPopupMessage] = useState(null);
  const [popupOnConfirm, setPopupOnConfirm] = useState(null);
  const [popupOnCancel, setPopupOnCancel] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken)
          throw new Error('Unauthorized: No access token found.');

        const response = await fetch(`${BASE_URL}/users/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: accessToken,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch user profile.');
        }

        const data = await response.json();
        setProfileData(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setPopupMessage('Are you sure to save the update?');
    setPopupOnConfirm(() => async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await fetch(`${BASE_URL}/users/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: accessToken,
          },
          body: JSON.stringify(profileData),
        });

        if (!response.ok) {
          throw new Error('Failed to update user profile.');
        }

        setPopupMessage(
          `Profile of ${profileData.firstName} ${profileData.lastName} has been saved successfully.`
        );
        setPopupOnConfirm(() => () => navigate(`/profile/${id}`)); // Navigate back
        setPopupOnCancel(null); // No cancel action needed after success
      } catch (err) {
        setPopupMessage(err.message);
        setPopupOnConfirm(null);
        setPopupOnCancel(null);
      }
    });
    setPopupOnCancel(() => () => navigate(`/profile/${id}`));
  };

  const handleDelete = () => {
    setPopupMessage(
      `Are you sure to delete team member ${profileData.firstName} ${profileData.lastName}?`
    );
    setPopupOnConfirm(() => async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await fetch(`${BASE_URL}/users/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: accessToken,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete user profile.');
        }

        setPopupMessage(
          `Profile of ${profileData.firstName} ${profileData.lastName} has been deleted successfully.`
        );
        setPopupOnConfirm(() => () => navigate('/admin')); // Navigate to admin page
        setPopupOnCancel(null);
      } catch (err) {
        setPopupMessage(err.message);
        setPopupOnConfirm(null);
        setPopupOnCancel(null);
      }
    });
    setPopupOnCancel(() => () => navigate(`/profile/${id}`));
  };

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="profile-container">
      <h1 className="profile-header">
        {id === user.id ? 'Your Profile' : `${profileData.firstName}'s Profile`}
      </h1>

      {popupMessage && (
        <ConfirmationPopup
          message={popupMessage}
          onConfirm={popupOnConfirm}
          onCancel={popupOnCancel}
          onClose={() => setPopupMessage(null)}
        />
      )}

      <ProfileForm
        profileData={profileData}
        isEditing={isEditing}
        onChange={handleChange}
        showRole={isAdmin()}
      />

      <div className="profile-actions">
        {isEditing ? (
          <>
            <ActionButton type="primary" onClick={handleSave}>
              Save
            </ActionButton>
            <ActionButton
              type="secondary"
              onClick={() => navigate(`/profile/${id}`)}
            >
              Cancel
            </ActionButton>
          </>
        ) : (
          <ActionButton type="primary" onClick={() => setIsEditing(true)}>
            Update Profile
          </ActionButton>
        )}
        {isAdmin() && !isEditing && (
          <ActionButton type="secondary" onClick={handleDelete}>
            Delete
          </ActionButton>
        )}
      </div>
    </div>
  );
};

export default Profile;
