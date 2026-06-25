import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar glass-panel">
      {/* Instagram-style Love Theme Floating Hearts */}
      <div className="floating-hearts">
        <span className="heart h1">❤️</span>
        <span className="heart h2">🤍</span>
        <span className="heart h3">💖</span>
        <span className="heart h4">🤍</span>
        <span className="heart h5">💕</span>
      </div>

      <div className="nav-brand">
        <Link to="/">✨ My Love</Link>
      </div>
      <div className="nav-links">
        <Link to="/" className={`nav-link ${isActive('/')}`}>Home</Link>
        <Link to="/story" className={`nav-link ${isActive('/story')}`}>Our Story</Link>
        <Link to="/travel" className={`nav-link ${isActive('/travel')}`}>Travels</Link>
        <Link to="/hall-of-fame" className={`nav-link ${isActive('/hall-of-fame')}`}>Hall of Fame</Link>
        <Link to="/reasons" className={`nav-link ${isActive('/reasons')}`}>Reasons Why</Link>
        <Link to="/bucket-list" className={`nav-link ${isActive('/bucket-list')}`}>Bucket List</Link>
        <Link to="/goals" className={`nav-link ${isActive('/goals')}`}>Goals</Link>
      </div>
    </nav>
  );
};

export default Navbar;
