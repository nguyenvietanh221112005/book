import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../pages/Navbar';
import '../styles/MyBookings.css';

const BASE_URL = "http://localhost:2211/api";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) {
          navigate('/');
          return;
        }

        const user = JSON.parse(userData);
        const response = await fetch(`${BASE_URL}/bookings/user/${user.id}`, {
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Không thể lấy danh sách đặt sân');
        }

        const data = await response.json();
        console.log('Bookings data:', data);
        setBookings(data);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đặt sân này?')) {
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Không thể hủy đặt sân');
      }

      // Cập nhật UI ngay lập tức
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? {...booking, status: 'cancelled'} 
            : booking
        )
      );

      alert('Hủy đặt sân thành công');
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  return (
    <div className="my-bookings-page">
      <Navbar />
      <div className="bookings-container">
        <h2>Lịch Sử Đặt Sân</h2>
        {bookings.length === 0 ? (
          <p>Bạn chưa có lịch đặt sân nào.</p>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                <div className="booking-info">
                  <h3>Sân {booking.field_id === 1 ? 'số 1' : 'số 2'}</h3>
                  <p>Ngày: {new Date(booking.booking_date).toLocaleDateString('vi-VN')}</p>
                  <p>Thời gian: {booking.start_time}</p>
                  <p>Giá: {booking.total_price.toLocaleString('vi-VN')} VNĐ</p>
                  <p>Trạng thái: {
                    booking.status === 'pending' ? 'Chờ xác nhận' :
                    booking.status === 'confirmed' ? 'Đã xác nhận' :
                    booking.status === 'cancelled' ? 'Đã hủy' : booking.status
                  }</p>
                </div>
                {booking.status !== 'cancelled' && (
                  <button 
                    onClick={() => handleCancelBooking(booking.id)}
                    className="cancel-button"
                  >
                    Hủy đặt sân
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookings;