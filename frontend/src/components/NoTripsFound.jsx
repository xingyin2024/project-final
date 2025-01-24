import { useNavigate } from 'react-router-dom';
import '../styles/noTripsFound.css';

const NoTripsFound = ({
  title = 'No trip report found!',
  subtitle = 'Create a trip report to get started',
  buttonText = 'Create Trip Report',
}) => {
  const navigate = useNavigate();

  return (
    <div className="no-trips-found">
      <p className="no-trips-title">{title}</p>
      <p className="no-trips-subtitle">{subtitle}</p>
      <button
        type="submit"
        className="primary-btn"
        onClick={() => navigate('/create-trip')}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default NoTripsFound;
