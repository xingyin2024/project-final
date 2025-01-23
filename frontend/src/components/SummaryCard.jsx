import PropTypes from 'prop-types';
import '../styles/summaryCard.css';

const SummaryCard = ({ title, value, label, onClick }) => {
  return (
    <button className="summary-card" onClick={onClick}>
      <h2 className="summary-card-value">{value}</h2>
      <p className="summary-card-label">{label}</p>
      <p className="summary-card-title">
        <b>{title}</b>
      </p>
    </button>
  );
};

SummaryCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default SummaryCard;
