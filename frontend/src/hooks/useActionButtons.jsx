import { useMemo } from 'react';
import ActionButton from '../components/ActionButton';

const useActionButtons = ({
  trip,
  isAdmin,
  navigate,
  handleDelete,
  handleSubmitTrip,
  handleApprove,
}) => {
  const { status = '', _id: tripId } = trip || {};

  const actionButtons = useMemo(() => {
    if (!trip) return null;

    // Common buttons
    const editButton = (
      <ActionButton
        type="secondary"
        onClick={() =>
          navigate(`/edit-trip/${tripId}`, {
            state: { trip }, // Pass trip data to the EditTrip page
          })
        }
      >
        Edit
      </ActionButton>
    );

    const deleteButton = (
      <ActionButton type="secondary" onClick={handleDelete}>
        Delete
      </ActionButton>
    );

    const submitButton = (
      <ActionButton type="primary" onClick={handleSubmitTrip}>
        Submit
      </ActionButton>
    );

    const approveButton = (
      <ActionButton type="primary" onClick={handleApprove}>
        Approve
      </ActionButton>
    );

    // Handle 'not submitted' case (applies to all users)
    if (status === 'not submitted') {
      return (
        <div className="trip-form-actions">
          <div className="trip-form-actions-row">
            {editButton}
            {deleteButton}
          </div>
          <div className="trip-form-actions-row">{submitButton}</div>
        </div>
      );
    }

    // Admin-specific cases
    if (isAdmin()) {
      switch (status) {
        case 'awaiting approval':
          return (
            <div className="trip-form-actions">
              <div className="trip-form-actions-row">
                {editButton}
                {deleteButton}
              </div>
              <div className="trip-form-actions-row">{approveButton}</div>
            </div>
          );
        case 'approved':
          return (
            <div className="trip-form-actions">
              <div className="trip-form-actions-row">
                {editButton}
                {deleteButton}
              </div>
            </div>
          );
        default:
          return null;
      }
    }

    // Default: no buttons for other roles or statuses
    return null;
  }, [trip, isAdmin, navigate, handleDelete, handleSubmitTrip, handleApprove]);

  return actionButtons;
};

export default useActionButtons;
