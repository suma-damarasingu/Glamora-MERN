const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings,
  updateBookingStatus
} = require('../controllers/bookingController');
const { verifyToken, requireAdmin, requireCustomer } = require('../middleware/auth');

// Customer: Create booking, view my bookings, cancel booking
router.post('/', verifyToken, requireCustomer, createBooking);
router.get('/my', verifyToken, requireCustomer, getMyBookings);
router.put('/:id/cancel', verifyToken, requireCustomer, cancelBooking);

// Admin: View all bookings, update booking status with slot conflict check
router.get('/', verifyToken, requireAdmin, getAllBookings);
router.put('/:id/status', verifyToken, requireAdmin, updateBookingStatus);

module.exports = router;
