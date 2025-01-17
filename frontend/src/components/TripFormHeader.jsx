import React from "react";
import { IoArrowBackSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import "../styles/tripForm.css";

const TripFormHeader = ({ title }) => {
  const navigate = useNavigate();

  return (
    <header className="trip-form-header">
      <button className="back-button" onClick={() => navigate(-1)}>
        <IoArrowBackSharp size={20} />
      </button>
      <h1 className="trip-form-title">{title}</h1>
    </header>
  );
};

TripFormHeader.propTypes = {
  title: PropTypes.string.isRequired,
};

export default TripFormHeader;
