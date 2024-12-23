import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "../styles/Booking.css";

const BASE_URL = "http://localhost:2211/api";

function Booking() {
  const navigate = useNavigate();
  const [bookedSlots, setBookedSlots] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [currentWeek, setCurrentWeek] = useState(0);

  const fetchBookedSlots = async () => {
    try {
      const response = await fetch(`${BASE_URL}/bookings`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể lấy danh sách đặt sân');
      }
      
      const data = await response.json();
      console.log('Fetched booked slots:', data);
      setBookedSlots(data);
    } catch (error) {
      console.error('Error fetching booked slots:', error);
      alert(error.message);
    }
  };

  useEffect(() => {
    const loadBookedSlots = async () => {
      await fetchBookedSlots();
    };
    loadBookedSlots();
  }, []);

  const times = ["05:30", "07:00", "08:30", "10:00", "11:30", "14:30", "16:00", "17:30", "19:00", "20:30", "22:00"];
  const courts = ["Sân số 1", "Sân số 2"];

  const prices = {
    "05:30": 300000,
    "07:00": 300000,
    "08:30": 300000,
    "10:00": 300000,
    "11:30": 300000,
    "14:30": 300000,
    "16:00": 300000,
    "17:30": 500000,
    "19:00": 500000,
    "20:30": 500000,
    "22:00": 300000,
  };

  const generateDays = () => {
    const days = [];
    const today = new Date();
    today.setDate(today.getDate() + currentWeek * 7);
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const days = generateDays();

  const formatDay = (date) => {
    const options = { weekday: "long", day: "2-digit", month: "2-digit" };
    return date.toLocaleDateString("vi-VN", options);
  };

  const handleSlotClick = (time, day, court) => {
    const slotId = `${time}-${day}-${court}`;
    if (!isBooked(time, day, court) && !isPastSlot(time, day)) {
      setSelectedSlots((prevSelectedSlots) => {
        if (prevSelectedSlots.some((slot) => slot.slotId === slotId)) {
          return prevSelectedSlots.filter((slot) => slot.slotId !== slotId);
        } else {
          return [...prevSelectedSlots, { slotId, time, day, court, price: prices[time] }];
        }
      });
    }
  };

  const isBooked = (time, day, court) => {
    return bookedSlots.some(slot => {
      const slotDate = new Date(slot.booking_date).toDateString();
      const checkDate = new Date(day).toDateString();
      const courtMatch = (court === 'Sân số 1' && slot.field_id === 1) || 
                        (court === 'Sân số 2' && slot.field_id === 2);
      const timeMatch = slot.start_time === time;
      
      return slotDate === checkDate && courtMatch && timeMatch;
    });
  };

  const isPastSlot = (time, day) => {
    const slotDate = new Date(day);
    const [hours, minutes] = time.split(":").map(Number);
    slotDate.setHours(hours, minutes, 0, 0);
    return slotDate < currentDate;
  };

  const handleBookingClick = () => {
    setShowForm(true);
  };

  const handleBooking = async () => {
    try {
      if (!customerInfo.email || !customerInfo.phone) {
        alert('Vui lòng điền đầy đủ thông tin email và số điện thoại');
        return;
      }

      const userData = localStorage.getItem('user');
      if (!userData) {
        alert('Vui lòng đăng nhập trước khi đặt sân');
        navigate('/');
        return;
      }

      // Disable nút đặt sân
      const submitButton = document.querySelector('.submit-btn');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Đang xử lý...';
      }

      const user = JSON.parse(userData);
      const bookingsData = selectedSlots.map(slot => ({
        user_id: parseInt(user.id),
        field_id: slot.court === 'Sân số 1' ? 1 : 2,
        time_slot_id: getTimeSlotId(slot.time),
        booking_date: slot.day,
        time: slot.time,
        price: prices[slot.time]
      }));

      const totalAmount = bookingsData.reduce((sum, booking) => sum + booking.price, 0);

      const response = await fetch(`${BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookings: bookingsData,
          customer_info: {
            name: user.name,
            email: customerInfo.email,
            phone: customerInfo.phone
          },
          total_amount: totalAmount
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Đặt sân thất bại');
      }

      // Format thông tin đặt sân để hiển thị
      const bookingDetails = selectedSlots.map(slot => 
        `${slot.court}\nNgày: ${new Date(slot.day).toLocaleDateString('vi-VN')}\n` +
        `Thời gian: ${slot.time}\nGiá: ${prices[slot.time].toLocaleString('vi-VN')} VNĐ`
      ).join('\n\n');

      // Hiển thị thông báo thành công
      alert(
        `ĐẶT SÂN THÀNH CÔNG!\n\n` +
        `Chi tiết đặt sân:\n${bookingDetails}\n\n` +
        `Tổng tiền: ${totalAmount.toLocaleString('vi-VN')} VNĐ\n\n` +
        `Thông tin chi tiết và hướng dẫn thanh toán đã được gửi đến email: ${customerInfo.email}\n` +
        `Vui lòng kiểm tra email và thanh toán trong vòng 15 phút để giữ lịch đặt sân.`
      );

      // Reset form và refresh danh sách
      setSelectedSlots([]);
      setShowForm(false);
      setCustomerInfo({ name: "", email: "", phone: "" });
      await fetchBookedSlots();

    } catch (error) {
      console.error('Error booking:', error);
      alert(error.message || 'Đặt sân thất bại. Vui lòng thử lại!');
    } finally {
      // Enable lại nút đặt sân
      const submitButton = document.querySelector('.submit-btn');
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Xác nhận đặt sân';
      }
    }
  };

  const getTimeSlotId = (time) => {
    const timeSlots = {
      "05:30": 1, "07:00": 2, "08:30": 3, "10:00": 4,
      "11:30": 5, "13:00": 6, "14:30": 7, "16:00": 8,
      "17:30": 9, "19:00": 10, "20:30": 11, "22:00": 12
    };
    return timeSlots[time];
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đặt sân này?')) {
      return;
    }

    try {
      console.log('Canceling booking:', bookingId);
      const response = await fetch(`${BASE_URL}/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Cancel response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Không thể hủy đặt sân');
      }

      // Cập nhật danh sách slots đã đặt
      if (data.updatedSlots) {
        setBookedSlots(data.updatedSlots);
      }

      // Refresh lại danh sách đã đặt
      await fetchBookedSlots();
      
      alert('Hủy đặt sân thành công');
    } catch (error) {
      console.error('Error canceling booking:', error);
      alert(error.message || 'Không thể hủy đặt sân');
    }
  };

  return (
    <div className="booking-page">
      <Navbar />

      <div className="week-navigation">
        <button onClick={() => setCurrentWeek(currentWeek - 1)}>&lt; Tuần trước</button>
        <button onClick={() => setCurrentWeek(currentWeek + 1)}>Tuần sau &gt;</button>
      </div>

      <div className="booking-table">
        <table>
          <thead>
            <tr>
              <th>Giờ</th>
              <th>Sân</th>
              {days.map((day) => (
                <th key={day}>{formatDay(day)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {times.map((time) =>
              courts.map((court) => (
                <tr key={`${time}-${court}`}>
                  <td>{time}</td>
                  <td>{court}</td>
                  {days.map((day) => {
                    const formattedDay = day.toISOString().split("T")[0];
                    return (
                      <td
                        key={`${time}-${formattedDay}-${court}`}
                        className={
                          isBooked(time, formattedDay, court)
                            ? "booked"
                            : isPastSlot(time, formattedDay)
                            ? "past"
                            : selectedSlots.some(
                                (slot) =>
                                  slot.time === time &&
                                  slot.day === formattedDay &&
                                  slot.court === court
                              )
                            ? "selected"
                            : "available"
                        }
                        onClick={() =>
                          handleSlotClick(time, formattedDay, court)
                        }
                      >
                        {!isPastSlot(time, formattedDay) &&
                        !isBooked(time, formattedDay, court)
                          ? `${prices[time].toLocaleString()} đ`
                          : ""}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {selectedSlots.length > 0 && !showForm && (
          <button onClick={handleBookingClick} className="booking-button">
            Đặt lịch
          </button>
        )}

        {showForm && (
          <div className="booking-form">
            <h2>Thông tin liên hệ</h2>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                placeholder="Nhập email của bạn"
                required
              />
            </div>
            <div className="form-group">
              <label>Số điện thoại:</label>
              <input
                type="tel"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                placeholder="Nhập số điện thoại"
                required
              />
            </div>
            <div className="form-buttons">
              <button onClick={handleBooking} className="submit-btn">Xác nhận đặt sân</button>
              <button onClick={() => setShowForm(false)} className="cancel-btn">Hủy</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Booking;
