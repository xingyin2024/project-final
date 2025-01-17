import React from "react";
import { IoArrowBackSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const TripCardHeader = ({ title }) => {
  const navigate = useNavigate();

  return (
    <header className="trip-card-header">
      <button className="back-button" onClick={() => navigate(-1)}>
        <IoArrowBackSharp size={20} />
      </button>
      <h1 className="trip-card-title">{title}</h1>
    </header>
  );
};

TripCardHeader.propTypes = {
  title: PropTypes.string.isRequired,
};

export default TripCardHeader;
