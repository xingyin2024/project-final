import PropTypes from 'prop-types';
import '../styles/tripForm.css';

/**
 * Renders two buttons: Save and Cancel.
 * The parent is responsible for all logic (onSave, onCancel, etc.).
 */
const TripFormButtons = ({ onSave = null, onCancel, disabledSave = false }) => {
  return (
    <div className="trip-form-actions">
      <div className="trip-form-actions-row">
        {/* The Save button can be "type=submit" if we rely on the parent's <form onSubmit=...> */}
        <button
          type="submit"
          className="primary-btn"
          disabled={disabledSave}
          onClick={onSave}
        >
          Save
        </button>

        <button type="button" className="secondary-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

TripFormButtons.propTypes = {
  onSave: PropTypes.func,
  onCancel: PropTypes.func.isRequired,
  disabledSave: PropTypes.bool,
};

export default TripFormButtons;
