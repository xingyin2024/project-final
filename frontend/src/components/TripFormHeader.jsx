import { IoArrowBackSharp } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import '../styles/tripFormHeader.css';

const TripFormHeader = ({ title, onBack }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="trip-form-header">
      <button className="back-button" onClick={handleBack}>
        <IoArrowBackSharp size={20} />
      </button>
      <h1 className="trip-form-title">{title}</h1>
    </header>
  );
};

TripFormHeader.propTypes = {
  title: PropTypes.string.isRequired,
  onBack: PropTypes.func,
};

export default TripFormHeader;
