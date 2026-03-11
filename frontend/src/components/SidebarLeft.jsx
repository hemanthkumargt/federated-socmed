import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiUser,
  FiFileText,
  FiSettings,
  FiServer,
  FiLogOut,
  FiShield,
  FiHelpCircle,
  FiActivity
} from 'react-icons/fi';
import { SERVERS } from '../config/api';

const SidebarLeft = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeServerUrl, setActiveServerUrl] = useState(
    localStorage.getItem('activeServer') || SERVERS[0].url
  );
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsAdmin(user.role === 'admin');
      } catch (e) {
        setIsAdmin(false);
      }
    }
  }, []);

  const handleServerSwitch = (serverUrl) => {
    if (serverUrl === activeServerUrl) return;
    
    // Clear session for the previous server
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.setItem('activeServer', serverUrl);
    
    // Refresh to apply new API URL and force re-login on the new server
    window.location.href = '/auth';
  };

  const handleNavClick = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  return (
    <aside className="left-sidebar">
      <div className="logo" style={{
        fontFamily: "'Fredoka One', cursive", 
        fontSize: '32px',
        background: 'linear-gradient(to right, #ffffff, #f472b6)', 
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: '900',
        textShadow: '0 4px 12px rgba(0,0,0,0.3)', 
        marginBottom: '40px'
      }}>Connect</div>

      <nav className="main-nav">
        <button
          className={`nav-item ${isActive('/') ? 'active' : ''}`}
          onClick={() => handleNavClick('/')}
        >
          <FiHome className="icon" /> Home
        </button>
        <button
          className={`nav-item ${isActive('/profile') ? 'active' : ''}`}
          onClick={() => handleNavClick('/profile')}
        >
          <FiUser className="icon" /> Profile
        </button>
        <button
          className={`nav-item ${isActive('/channels') ? 'active' : ''}`}
          onClick={() => handleNavClick('/channels')}
        >
          <FiFileText className="icon" /> Channels
        </button>
        <button
          className={`nav-item ${isActive('/server-details') ? 'active' : ''}`}
          onClick={() => handleNavClick('/server-details')}
        >
          <FiServer className="icon" /> Server Details
        </button>
        <button
          className={`nav-item ${isActive('/settings') ? 'active' : ''}`}
          onClick={() => handleNavClick('/settings')}
        >
          <FiSettings className="icon" /> Settings
        </button>
        {isAdmin && (
          <button
            className={`nav-item ${isActive('/admin') ? 'active' : ''}`}
            onClick={() => handleNavClick('/admin')}
          >
            <FiShield className="icon" /> Admin
          </button>
        )}
        <button
          className={`nav-item ${isActive('/help-center') ? 'active' : ''}`}
          onClick={() => handleNavClick('/help-center')}
        >
          <FiHelpCircle className="icon" /> Help Center
        </button>
        <button
          className="nav-item logout-btn"
          onClick={handleLogout}
        >
          <FiLogOut className="icon" /> Logout
        </button>
      </nav>

    </aside>
  );
};

export default SidebarLeft;
