import PropTypes from 'prop-types';
import '../styles/confirmationPopup.css';

const ConfirmationPopup = ({ message, onClose }) => {
  return (
    <div className="confirmation-popup-overlay">
      <div className="confirmation-popup">
        <p>{message}</p>
        <button className="primary-btn" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
};

ConfirmationPopup.propTypes = {
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ConfirmationPopup;
