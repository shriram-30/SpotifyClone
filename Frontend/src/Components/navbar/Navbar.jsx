import React from 'react';
import './Navbar.css';
import { FaSearch, FaHome, FaDownload } from 'react-icons/fa';
import { BsSpotify } from 'react-icons/bs';
import { FiBox } from 'react-icons/fi';

const Navbar = () => {
  return (
    <div className="navbar">
      <div className="nav-left">
        <BsSpotify className="logo" />
        <div className="icon-circle"><FaHome /></div>
        <div className="search-bar">
          <FaSearch />
          <input type="text" placeholder="What do you want to play?" />
          <FiBox />
        </div>
      </div>

      <div className="nav-right">
        <span>Premium</span>
        <span>Support</span>
        <span>Download</span>
        <div className="divider" />
        <FaDownload className="icon" />
        <span>Install App</span>
        <span>Sign up</span>
        <button className="login-btn">Log in</button>
      </div>
    </div>
  );
};

export default Navbar;
