import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleBookingClick = () => {
    if (!user) {
      navigate('/bookinglogin');
    } else {
      navigate('/booking');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">Pickleball Arena</div>
      <ul className="navbar-links">
        <li>
          <Link to="/HomePage">Trang chủ</Link>
        </li>
        <li>
          <a href="#" onClick={handleBookingClick}>Đặt lịch</a>
        </li>
        {user && (
          <li>
            <Link to="/my-bookings">Lịch đã đặt</Link>
          </li>
        )}
        {user ? (
          <>
            <span className="welcome-text">Xin chào, {user.name}</span>
            <button onClick={handleLogout} className="logout-btn">
              Đăng xuất
            </button>
          </>
        ) : (
          <li>
            <Link to="/login">Đăng nhập</Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;