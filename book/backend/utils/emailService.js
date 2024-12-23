const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'anh508023@gmail.com',
    pass: 'ioxo uaxe smjn pucw'
  }
});

const sendBookingConfirmation = async (bookingDetails) => {
  try {
    if (!bookingDetails.customer_info || !bookingDetails.customer_info.email) {
      throw new Error('Missing customer email information');
    }

    // Tạo danh sách các sân đã đặt
    const bookedFieldsList = bookingDetails.bookings.map(booking => `
      <tr>
        <td>Sân ${booking.field_id === 1 ? 'số 1' : 'số 2'}</td>
        <td>${booking.booking_date}</td>
        <td>${booking.time}</td>
        <td>${booking.price.toLocaleString('vi-VN')} VNĐ</td>
      </tr>
    `).join('');

    const mailOptions = {
      from: 'Pickleball Arena <anh508023@gmail.com>',
      to: bookingDetails.customer_info.email,
      subject: 'Xác nhận đặt sân Pickleball thành công',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50; text-align: center;">Xác nhận đặt sân thành công</h2>
          
          <p>Xin chào <strong>${bookingDetails.customer_info.name}</strong>,</p>
          <p>Cảm ơn bạn đã đặt sân tại Pickleball Arena. Dưới đây là thông tin đặt sân của bạn:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 10px; border: 1px solid #ddd;">Sân</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Ngày</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Giờ</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Giá</th>
              </tr>
            </thead>
            <tbody>
              ${bookedFieldsList}
              <tr style="background-color: #f8f9fa; font-weight: bold;">
                <td colspan="3" style="padding: 10px; border: 1px solid #ddd;">Tổng cộng:</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${bookingDetails.total_amount.toLocaleString('vi-VN')} VNĐ</td>
              </tr>
            </tbody>
          </table>

          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
            <h3 style="color: #2c3e50; margin-top: 0;">Thông tin thanh toán:</h3>
            <p>Vui lòng chuyển khoản theo thông tin sau:</p>
            <ul style="list-style: none; padding-left: 0;">
              <li>Số tài khoản: 0376125660</li>
              <li>Ngân hàng: Techcombank</li>
              <li>Chủ tài khoản: Nguyen Viet Anh</li>
              <li>Nội dung: ${bookingDetails.customer_info.name} - Đặt sân Pickleball</li>
            </ul>
          </div>

          <p style="color: #e74c3c; font-weight: bold; text-align: center;">
            ⚠️ Vui lòng thanh toán trong vòng 15 phút để giữ lịch đặt sân
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', bookingDetails.customer_info.email);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = { sendBookingConfirmation };