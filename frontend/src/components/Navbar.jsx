import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { CiHome, CiLogin, CiLogout } from 'react-icons/ci';
import {
  IoGridOutline,
  IoCreateOutline,
  IoMailOutline,
  IoInformationCircleOutline,
  IoPersonCircleOutline,
} from 'react-icons/io5';

import { useUser } from '../context/UserContext';
import '../styles/navbar.css';

const IconButton = ({ onClick, isClose }) => (
  <button
    className="nav-icon-button"
    onClick={onClick}
    aria-label={isClose ? 'Close Menu' : 'Open Menu'}
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

const NavItem = ({ to, icon: Icon, label, isButton = false, onClick }) => (
  <li>
    {isButton ? (
      <button className="nav-item" onClick={onClick} aria-label={label}>
        <Icon className="nav-icon" />
        {label}
      </button>
    ) : (
      <Link to={to} className="nav-item" onClick={onClick} aria-label={label}>
        <Icon className="nav-icon" />
        {label}
      </Link>
    )}
  </li>
);

const Navbar = () => {
  const { user, logout } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const navItems = user
    ? [
        { to: '/dashboard', icon: CiHome, label: 'Dashboard' },
        { to: '/create-trip', icon: IoCreateOutline, label: 'Create Trip' },
        {
          to: '/profile/${user.id}',
          icon: IoPersonCircleOutline,
          label: 'Profile',
        },
        ...(user.role === 'admin'
          ? [{ to: '/admin', icon: IoGridOutline, label: 'Admin' }]
          : []),
        {
          isButton: true,
          onClick: handleLogout,
          icon: CiLogout,
          label: 'Logout',
        },
      ]
    : [
        { to: '/', icon: CiHome, label: 'Home' },
        { to: '/about', icon: IoInformationCircleOutline, label: 'About' },
        { to: '/contact', icon: IoMailOutline, label: 'Contact' },
        { to: '/login', icon: CiLogin, label: 'Login' },
      ];

  return (
    <div className="navbar-container">
      {/* Hamburger Icon */}
      {!menuOpen && <IconButton onClick={() => setMenuOpen(true)} />}

      {/* Navbar Drawer */}
      {menuOpen && (
        <div className="nav-drawer">
          {/* Close Icon */}
          <IconButton onClick={() => setMenuOpen(false)} isClose />

          {/* Profile Section or Placeholder */}
          <div className="profile-section">
            {user ? (
              <>
                <img
                  src="/profile-pic.png"
                  alt="Profile"
                  className="profile-pic"
                />
                <span className="profile-name">
                  Hi {user.firstName || 'Guest'}!
                </span>
              </>
            ) : (
              <div className="profile-placeholder"></div> /* Placeholder for consistent layout */
            )}
          </div>

          {/* Navigation Links */}
          <ul className="nav-items">
            {navItems.map(
              ({ to, icon, label, isButton = false, onClick }, index) => (
                <NavItem
                  key={index}
                  to={to}
                  icon={icon}
                  label={label}
                  isButton={isButton}
                  onClick={onClick || (() => setMenuOpen(false))}
                />
              )
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;
