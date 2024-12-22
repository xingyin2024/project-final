const Button = ({ label, variant = "primary", onClick }) => {
  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
  };

  return (
    <button onClick={onClick} className={`${variants[variant]} transition hover:opacity-90`}>
      {label}
    </button>
  );
};

export default Button;
