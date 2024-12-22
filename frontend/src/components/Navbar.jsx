import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CiHome, CiSettings, CiLogin, CiLogout } from "react-icons/ci";
import { IoGridOutline, IoCreateOutline } from "react-icons/io5";


const IconButton = ({ onClick, isClose }) => (
  <button
    className="nav-icon-button"
    onClick={onClick}
    aria-label={isClose ? "Close Menu" : "Open Menu"}
  >
    <div className="nav-icon-lines">
      {isClose ? (
        <>
          <span className="nav-icon-line nav-icon-line-close rotate-45"></span>
          <span className="nav-icon-line nav-icon-line-close -rotate-45"></span>
        </>
      ) : (
        <>
          <span className="nav-icon-line"></span>
          <span className="nav-icon-line"></span>
          <span className="nav-icon-line"></span>
        </>
      )}
    </div>
  </button>
);

const NavItem = ({ to, icon: Icon, label, isButton = false, onClick }) => {
  const sharedClasses =
    "nav-item flex items-center px-4 py-2 rounded-md text-black-mid transition hover:bg-white hover:text-pink-from hover:border-pink-from";
  const IconComponent = <Icon className="nav-icon" size={20} />;
  const Label = <span>{label}</span>;

  if (isButton) {
    return (
      <li>
        <button className={`${sharedClasses} border w-full text-left`} onClick={onClick}>
          {IconComponent}
          {Label}
        </button>
      </li>
    );
  }

  return (
    <li>
      <Link to={to} className={`${sharedClasses} border`} onClick={onClick}>
        {IconComponent}
        {Label}
      </Link>
    </li>
  );
};

const Navbar = () => {
  // const { user, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  return (
    <div className="navbar-container">
      {/* Hamburger Icon */}
      {!menuOpen && <IconButton onClick={() => setMenuOpen(true)} />}

      {/* Navbar Drawer */}
      {menuOpen && (
        <div
          className={`nav-drawer nav-drawer-open`}
        >
          {/* Close Icon */}
          <IconButton onClick={() => setMenuOpen(false)} isClose />

          {/* Profile Section */}
          <div className="profile-section">
            <img
              src="/profile-pic.png"
              alt="Profile"
              className="profile-pic"
            />
            <span className="profile-name">Hi! {user?.firstname || "Guest"}</span>
          </div>

          {/* Navigation Links */}
          <ul className="nav-items">
            {[
              { to: "/dashboard", icon: CiHome, label: "Dashboard" },
              { to: "/create-trip", icon: IoCreateOutline, label: "Create Trip Report" },
              { to: "/settings", icon: CiSettings, label: "Settings" },
              ...(user?.role === "admin"
                ? [{ to: "/admin", icon: IoGridOutline, label: "Admin" }]
                : []),
              user
                ? {
                    isButton: true,
                    onClick: handleLogout,
                    icon: CiLogout,
                    label: "Logout",
                  }
                : { to: "/login", icon: CiLogin, label: "Login" },
            ].map(({ to, icon, label, isButton = false, onClick }, index) => (
              <NavItem
                key={index}
                to={to}
                icon={icon}
                label={label}
                isButton={isButton}
                onClick={onClick || (() => setMenuOpen(false))}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;
