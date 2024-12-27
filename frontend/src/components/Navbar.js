import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">YourLogo</Link>
      </div>
      <button className="burger-menu" onClick={toggleMenu}>
        ☰
      </button>
      <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
        <Link to="/tasks">Task Manager</Link>
        <Link to="/ecommerce">E-commerce</Link>
        <Link to="/cart">View Cart</Link>
        <Link to="/orders">Your Orders</Link>
        <button onClick={() => {
          localStorage.removeItem('token');
          window.location.href = '/auth'; // Redirect to login
        }}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
