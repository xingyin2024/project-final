const AlertMessage = ({ message }) => {
  if (!message) return null;

  return <p className="error-message">{message}</p>;
};

export default AlertMessage;
