import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Cinema 21
        </Link>

        <button className="navbar-toggle" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          <li className="navbar-item">
            <Link to="/" className="navbar-link" onClick={() => setMenuOpen(false)}>
              영화
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/popular" className="navbar-link" onClick={() => setMenuOpen(false)}>
              인기영화
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/articles" className="navbar-link" onClick={() => setMenuOpen(false)}>
              기사
            </Link>
          </li>
        </ul>

        <div className="navbar-auth">
          {isAuthenticated ? (
            <>
              <span className="navbar-user">안녕하세요, {user?.username}님</span>
              <button className="navbar-button" onClick={handleLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-button">
                로그인
              </Link>
              <Link to="/signup" className="navbar-button navbar-button-signup">
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
