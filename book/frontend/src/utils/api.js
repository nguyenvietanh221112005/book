import axios from "axios";

const BASE_URL = "http://localhost:3013"; // Đổi thành port 3013 để match với backend

// Tạo instance axios với config mặc định
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Lấy danh sách slot đã đặt
export const getBookedSlots = async () => {
  try {
    const response = await api.get('/api/bookings');
    return response.data;
  } catch (error) {
    console.error("Error fetching booked slots:", error);
    throw error;
  }
};

// Gửi thông tin đặt sân
export const createBooking = async (bookingInfo) => {
  try {
    const response = await api.post('/api/bookings', bookingInfo);
    return response.data;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
};

// Lấy danh sách sân
export const getFields = async () => {
  try {
    const response = await api.get('/api/fields');
    return response.data;
  } catch (error) {
    console.error("Error fetching fields:", error);
    throw error;
  }
};

// Lấy lịch sử đặt sân của user
export const getUserBookings = async (userId) => {
  try {
    const response = await api.get(`/api/bookings/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    throw error;
  }
};