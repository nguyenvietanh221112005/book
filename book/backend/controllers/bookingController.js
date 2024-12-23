const bookingModel = require("../models/bookingModel");
const { sendBookingConfirmation } = require("../utils/emailService");

const getBookedSlots = async (req, res) => {
  try {
    const slots = await bookingModel.getBookedSlots();
    console.log('Sending booked slots:', slots);
    res.status(200).json(slots);
  } catch (error) {
    console.error('Error getting booked slots:', error);
    res.status(500).json({ 
      message: error.message || "Không thể lấy danh sách đặt sân"
    });
  }
};
// ... các import và code khác ở trên ...

const getBookingsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('Fetching bookings for user:', userId);

    const bookings = await bookingModel.getBookingsByUser(userId);
    console.log('Found bookings:', bookings);
    
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error in getBookingsByUser:', error);
    res.status(500).json({ 
      message: "Lỗi khi lấy danh sách đặt sân", 
      error: error.message 
    });
  }
};



const createBooking = async (req, res) => {
  try {
    const { bookings, customer_info } = req.body;

    if (!bookings?.length || !customer_info?.email) {
      return res.status(400).json({
        message: "Thiếu thông tin đặt sân hoặc email"
      });
    }

    const createdBookings = [];
    let totalAmount = 0;

    for (const booking of bookings) {
      try {
        const bookingId = await bookingModel.createBooking({
          user_id: booking.user_id,
          field_id: booking.field_id,
          time_slot_id: booking.time_slot_id,
          booking_date: booking.booking_date,
          total_price: booking.price,
          status: 'pending'
        });

        createdBookings.push({
          ...booking,
          id: bookingId
        });

        totalAmount += booking.price;
      } catch (error) {
        console.error('Error creating booking:', error);
        throw error;
      }
    }

    // Gửi email xác nhận
    try {
      await sendBookingConfirmation({
        bookings: createdBookings,
        customer_info,
        total_amount: totalAmount
      });
      console.log('Email sent to:', customer_info.email);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
    }

    res.status(201).json({
      message: "Đặt sân thành công",
      bookings: createdBookings,
      total_amount: totalAmount
    });

  } catch (error) {
    console.error('Error in createBooking:', error);
    res.status(500).json({ 
      message: error.message || "Lỗi khi đặt sân"
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    console.log('Cancelling booking:', bookingId);

    // Cập nhật trạng thái booking và lấy thông tin mới
    const updatedBooking = await bookingModel.updateBookingStatus(bookingId, 'cancelled');
    
    if (!updatedBooking) {
      throw new Error('Không thể cập nhật trạng thái đặt sân');
    }

    res.status(200).json({ 
      message: "Hủy đặt sân thành công",
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Error canceling booking:', error);
    res.status(500).json({ 
      message: error.message || "Không thể hủy đặt sân" 
    });
  }
};

module.exports = { 
  getBookedSlots, 
  createBooking, 
  getBookingsByUser,
  cancelBooking 
};