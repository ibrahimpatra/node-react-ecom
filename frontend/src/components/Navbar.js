import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => (
  <nav className="navbar">
    <Link to="/tasks">Task Manager</Link>
    <Link to="/ecommerce">E-commerce</Link>
    <button onClick={() => {
        localStorage.removeItem('token');
        window.location.href = '/auth'; // Redirect to login
    }}>Logout</button>
  </nav>
);

export default Navbar;
