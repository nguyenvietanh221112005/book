const express = require("express");
const { 
  getBookedSlots, 
  createBooking, 
  getBookingsByUser, 
  cancelBooking 
} = require("../controllers/bookingController");

const router = express.Router();

router.get("/", getBookedSlots);
router.post("/", createBooking);
router.get('/user/:userId', getBookingsByUser);
router.put('/:id/cancel', cancelBooking);

module.exports = router;