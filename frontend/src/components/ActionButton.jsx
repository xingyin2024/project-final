import PropTypes from 'prop-types';

const ActionButton = ({ type = 'secondary', onClick, children }) => (
  <button
    className={`${type === 'primary' ? 'primary-btn' : 'secondary-btn'}`}
    onClick={onClick}
  >
    {children}
  </button>
);

ActionButton.propTypes = {
  type: PropTypes.oneOf(['primary', 'secondary']),
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default ActionButton;
