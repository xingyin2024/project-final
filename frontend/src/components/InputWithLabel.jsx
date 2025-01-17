import AlertMessage from "./AlertMessage";

const InputWithLabel = ({ label, name, value, onChange, type = "text", placeholder, alertMessage, min }) => (
  <div className="trip-row">
    <p className="trip-label">{label}</p>
    <input
      type={type}
      name={name}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      min={min}
      required
    />
    {alertMessage && <AlertMessage message={alertMessage} />}
  </div>
);

export default InputWithLabel;