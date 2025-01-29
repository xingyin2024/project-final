import PropTypes from 'prop-types';
import '../styles/confirmationPopup.css';

const ConfirmationPopup = ({
  message,
  onConfirm, // function to call when the user confirms (Yes button)
  onCancel, // function to call when the user cancels (No button)
  onClose, // function to call when the user closes an informational message
}) => {
  // Use confirmation mode only if both onConfirm and onCancel are provided.
  const isConfirmationMode =
    typeof onConfirm === 'function' && typeof onCancel === 'function';

  // When in info mode, clicking the single OK button will call onClose.
  const handleOkClick = () => {
    if (onClose) onClose();
  };

  return (
    <div className="confirmation-popup-overlay">
      <div className="confirmation-popup">
        <p className="confirmation-popup-message">{message}</p>
        {isConfirmationMode ? (
          <div className="confirmation-popup-buttons">
            <button
              className="primary-btn confirmation-popup-btn"
              onClick={onConfirm}
            >
              Yes
            </button>
            <button
              className="secondary-btn confirmation-popup-btn"
              onClick={onCancel}
            >
              No
            </button>
          </div>
        ) : (
          <button
            className="secondary-btn confirmation-popup-btn"
            onClick={handleOkClick}
          >
            OK
          </button>
        )}
      </div>
    </div>
  );
};

ConfirmationPopup.propTypes = {
  message: PropTypes.string.isRequired,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  onClose: PropTypes.func,
};

export default ConfirmationPopup;
