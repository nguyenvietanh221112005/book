import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomeLogin from './Login/HomeLogin';
import HomePage from './pages/HomePage';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import BookingLogin from './Login/BookingLogin';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<HomeLogin />} />
          <Route path="/homepage" element={<HomePage />} />
          <Route path="/bookinglogin" element={<BookingLogin />} />
          
          <Route path="/booking" element={<Booking />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;