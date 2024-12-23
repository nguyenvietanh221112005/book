const db = require("../config/database");
const util = require('util');
const query = util.promisify(db.query).bind(db);

const getBookedSlots = async () => {
  try {
    const sql = `
      SELECT 
        b.id,
        b.field_id,
        b.time_slot_id,
        b.booking_date,
        b.status,
        f.name as field_name,
        ts.start_time,
        ts.end_time 
      FROM bookings b
      JOIN fields f ON b.field_id = f.id
      JOIN time_slots ts ON b.time_slot_id = ts.id
      WHERE b.status != 'cancelled'
      ORDER BY b.booking_date ASC, ts.start_time ASC
    `;
    const [rows] = await db.execute(sql);
    console.log('Fetched booked slots:', rows);
    return rows;
  } catch (error) {
    console.error('Error in getBookedSlots:', error);
    throw new Error('Không thể lấy danh sách đặt sân');
  }
};

const createBooking = async (booking) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { user_id, field_id, time_slot_id, booking_date, total_price, status } = booking;
    
    // Kiểm tra slot có trống không
    const [checkResult] = await connection.query(
      `SELECT COUNT(*) as count 
       FROM bookings 
       WHERE field_id = ? 
       AND time_slot_id = ? 
       AND booking_date = ?
       AND status != 'cancelled'`,
      [field_id, time_slot_id, booking_date]
    );
    
    if (checkResult[0].count > 0) {
      throw new Error('Slot đã được đặt');
    }

    // Thêm booking mới
    const [result] = await connection.query(
      `INSERT INTO bookings 
       (user_id, field_id, time_slot_id, booking_date, total_price, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, field_id, time_slot_id, booking_date, total_price, status || 'pending']
    );

    await connection.commit();
    return result.insertId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const checkSlotAvailability = async (fieldId, timeSlotId, bookingDate) => {
  const sql = `
    SELECT COUNT(*) as count 
    FROM bookings 
    WHERE field_id = ? 
    AND time_slot_id = ?
    AND booking_date = ?
    AND status != 'cancelled'
  `;
  
  const [result] = await query(sql, [fieldId, timeSlotId, bookingDate]);
  return result.count > 0;
};

const getBookingsByUser = async (userId) => {
  try {
    const sql = `
      SELECT 
        b.*,
        f.name as field_name,
        ts.start_time,
        ts.end_time
      FROM bookings b
      JOIN fields f ON b.field_id = f.id
      JOIN time_slots ts ON b.time_slot_id = ts.id
      WHERE b.user_id = ?
      ORDER BY b.booking_date DESC, ts.start_time ASC
    `;
    
    const [rows] = await db.execute(sql, [userId]);
    console.log('Found bookings for user:', userId, rows);
    return rows;
  } catch (error) {
    console.error('Error in getBookingsByUser:', error);
    throw new Error('Không thể lấy danh sách đặt sân');
  }
};

const getTimeSlotInfo = async (timeSlotId) => {
  const sql = `
    SELECT * FROM time_slots 
    WHERE id = ?
  `;
  const [row] = await query(sql, [timeSlotId]);
  if (!row) throw new Error('Time slot not found');
  return row;
};

const getFieldInfo = async (fieldId) => {
  const sql = `
    SELECT * FROM fields 
    WHERE id = ?
  `;
  const [row] = await query(sql, [fieldId]);
  if (!row) throw new Error('Field not found');
  return row;
};

const updateBookingStatus = async (bookingId, status) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Kiểm tra booking tồn tại
    const [bookings] = await connection.query(
      'SELECT * FROM bookings WHERE id = ?',
      [bookingId]
    );

    if (!bookings.length) {
      throw new Error('Không tìm thấy thông tin đặt sân');
    }

    // Cập nhật trạng thái (bỏ updated_at vì chưa có cột này)
    const [result] = await connection.query(
      'UPDATE bookings SET status = ? WHERE id = ?',
      [status, bookingId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Không thể cập nhật trạng thái');
    }

    await connection.commit();
    
    // Lấy thông tin booking sau khi cập nhật
    const [updatedBooking] = await connection.query(
      'SELECT * FROM bookings WHERE id = ?',
      [bookingId]
    );

    return updatedBooking[0];
  } catch (error) {
    await connection.rollback();
    console.error('Error in updateBookingStatus:', error);
    throw error;
  } finally {
    connection.release();
  }
};

const getBookingById = async (bookingId) => {
  try {
    const sql = `
      SELECT * FROM bookings 
      WHERE id = ?
    `;
    const [row] = await query(sql, [bookingId]);
    return row;
  } catch (error) {
    console.error('Error in getBookingById:', error);
    throw error;
  }
};

const deleteBooking = async (bookingId) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const deleteSql = `
      DELETE FROM bookings 
      WHERE id = ?
    `;
    
    const [result] = await connection.execute(deleteSql, [bookingId]);
    
    if (result.affectedRows === 0) {
      throw new Error('Không tìm thấy booking');
    }

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    console.error('Error in deleteBooking:', error);
    throw new Error(`Không thể xóa booking: ${error.message}`);
  } finally {
    connection.release();
  }
};

module.exports = { 
  getBookedSlots, 
  createBooking, 
  checkSlotAvailability,
  getBookingsByUser,
  getTimeSlotInfo,
  getFieldInfo,
  updateBookingStatus,
  getBookingById,
  deleteBooking 
};