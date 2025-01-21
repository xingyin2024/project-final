import PropTypes from 'prop-types';
import '../styles/confirmationPopup.css';

const ConfirmationPopup = ({ message, onClose }) => {
  return (
    <div className="confirmation-popup-overlay">
      <div className="confirmation-popup">
        <p className="confirmation-popup-message">{message}</p>
        <button
          className="secondary-btn confirmation-popup-btn"
          onClick={onClose}
        >
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
