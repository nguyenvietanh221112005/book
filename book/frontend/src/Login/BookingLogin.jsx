import React, { useState, useEffect } from "react";
import LoginRegister from "./LoginRegister";
import { useNavigate } from "react-router-dom";
import "../styles/Booking.css";
import '../styles/Navbar.css';

const BASE_URL = "http://localhost:2211/api";

function BookingLogin() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: "", email: "", sdt: "" });
  const [currentWeek, setCurrentWeek] = useState(0);
  const [userId, setUserId] = useState(null); // Lưu ID người dùng

  const bankAccountNumber = "0376125660 techcombank nguyenvietanh";

  // Giả sử bạn đã có cơ chế để lấy userId khi người dùng đăng nhập
  useEffect(() => {
    const fetchUserId = async () => {
      // Lấy user_id từ API backend khi người dùng đã đăng nhập
      const response = await fetch(`${BASE_URL}/users/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Giả sử token được lưu trong localStorage
        },
      });
      if (response.ok) {
        const userData = await response.json();
        setUserId(userData.id); // Gán userId từ dữ liệu người dùng
      } else {
        console.error("Không thể lấy thông tin người dùng");
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchBookedSlots = async () => {
      try {
        const response = await fetch(`${BASE_URL}/bookings`);
        const data = await response.json();
        setBookedSlots(data.map((slot) => slot.slotId));
      } catch (error) {
        console.error("Error fetching booked slots:", error);
      }
    };

    fetchBookedSlots();
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
  const openLoginForm = () => {
    setIsRegister(false);
    setIsModalOpen(true);
  };
  const openSignupForm = () => {
    setIsRegister(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    if (userData.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/homepage');
    }
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
    const slotId = `${time}-${day}-${court}`;
    return bookedSlots.includes(slotId);
  };

  const isPastSlot = (time, day) => {
    const slotDate = new Date(day);
    const [hours, minutes] = time.split(":").map(Number);
    slotDate.setHours(hours, minutes, 0, 0);
    return slotDate < currentDate;
  };

  const handleBooking = () => {
    setShowForm(true);
  };

  const calculateTotalPrice = () => {
    return selectedSlots.reduce((total, slot) => total + slot.price, 0);
  };

  const handleFormSubmit = async () => {
    if (!userId) {
      alert("Bạn cần đăng nhập trước khi đặt sân.");
      return;
    }

    const bookingInfo = {
      user_id: userId, // Gửi user_id vào khi đặt sân
      slots: selectedSlots.map((slot) => ({
        field_id: courts.indexOf(slot.court) + 1, // Chuyển sân thành field_id
        booking_date: slot.day,
        start_time: slot.time,
        end_time: slot.time, // Giả sử hết giờ là giờ hiện tại cộng thêm 1 tiếng
        status: "pending", // Trạng thái mặc định là pending
      })),
      totalPrice: calculateTotalPrice(),
    };

    try {
      const response = await fetch(`${BASE_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingInfo),
      });

      if (!response.ok) throw new Error("Đặt sân thất bại");

      const newBookedSlotsIds = selectedSlots.map((slot) => slot.slotId);
      setBookedSlots((prev) => [...prev, ...newBookedSlotsIds]);

      alert(
        `Thông báo đã gửi đến email: ${customerInfo.email}\nCác sân đã đặt:\n${selectedSlots
          .map((slot) => `${slot.court} - ${slot.time} - ${slot.day} - ${slot.price.toLocaleString()} đ`)
          .join("\n")}\nTổng số tiền: ${calculateTotalPrice().toLocaleString()} đ\nSố tài khoản ngân hàng: ${bankAccountNumber}`
      );

      setCustomerInfo({ name: "", email: "", sdt: "" });
      setShowForm(false);
      setSelectedSlots([]);
    } catch (error) {
      alert("Đặt sân thất bại, vui lòng thử lại.");
    }
  };

  return (
    <div className="booking-page">
      <nav className="navbar">
        <div className="navbar-brand">Pickleball Arena</div>
        <ul className="navbar-links">
          <li><a href="/">Trang Chủ</a></li>
          <li><a href="/bookinglogin">Đặt Lịch</a></li>
          <li><button className="nav-button" onClick={openLoginForm}>Đăng nhập</button></li>
          <li><button className="nav-button" onClick={openSignupForm}>Đăng ký</button></li>
        </ul>
      </nav>

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

        {selectedSlots.length > 0 && (
          <button onClick={handleBooking} className="booking-button">
            Đặt lịch
          </button>
        )}

        {showForm && (
          <div className="booking-form">
            <h2>Thông tin khách hàng</h2>
            <label>
              Tên:
              <input
                type="text"
                value={customerInfo.name}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, name: e.target.value })
                }
              />
            </label>
            <label>
              SĐT:
              <input
                type="text"
                value={customerInfo.sdt}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, sdt: e.target.value })
                }
              />
            </label>
            <label>
              Email:
              <input
                type="email"
                value={customerInfo.email}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, email: e.target.value })
                }
              />
            </label>
            <button onClick={handleFormSubmit}>OK</button>
            <button onClick={() => setShowForm(false)}>Hủy</button>
          </div>
        )}
      </div>
      {isModalOpen && (
        <LoginRegister 
          isRegister={isRegister}
          onClose={closeModal}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
    
  );
}

export default BookingLogin;
