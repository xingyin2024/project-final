import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { useUser } from "../context/UserContext";
import "../styles/header.css";

export const Header = () => {
  const {
    isLoggedIn,
    signout,
    setUser,
    isPanelOpen,
    setIsPanelOpen,
  } = useUser();
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const [panelType, setPanelType] = useState(null);

  useEffect(() => {
    const firstName = localStorage.getItem("firstName");
    if (firstName) {
      setUser({ firstName });
    }
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      fetchProgress();
      fetchMathProgress();
    }
  }, []);

  const toggleHamburger = () => {
    setHamburgerOpen(!hamburgerOpen);
  };

  const openPanel = (type) => {
    setPanelType(type);
    setIsPanelOpen(true);
    setHamburgerOpen(false);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setPanelType(null);
  };

  return (
    <header className="header-container">
      <Link to="/" className="logo">
        <img src="/logo.png" alt="Logo" />
      </Link>
      <div className="menu-icon" onClick={toggleHamburger}>
        {hamburgerOpen ? <FaTimes /> : <FaBars />}
      </div>
      <nav className={`nav-menu ${hamburgerOpen ? "open" : ""}`}>
        {isLoggedIn ? (
          <div className="logged-in">
            <Link to="/play" onClick={toggleHamburger} className="nav-link">Play</Link>
            <Link to="/progress" onClick={toggleHamburger} className="nav-link">My Progress</Link>
            <div className="signout" onClick={signout}>
              <FiLogOut />
              <span>Sign Out</span>
            </div>
          </div>
        ) : (
          <div className="start-page">
            <button className="nav-button" onClick={() => openPanel("register")}>Register</button>
            <button className="nav-button" onClick={() => openPanel("login")}>Log In</button>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
