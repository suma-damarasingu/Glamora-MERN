const Booking = require('../models/Booking');

// Fixed salon time slots
const FIXED_SLOTS = [
  '10:00 AM',
  '12:00 PM',
  '02:00 PM',
  '04:00 PM',
  '06:00 PM'
];

/**
 * @route   GET /api/slots/available
 * @desc    Get slot availability for a given date
 * @query   date (YYYY-MM-DD), serviceId (optional)
 */
const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required (YYYY-MM-DD).'
      });
    }

    // Find bookings on this date that occupy a slot (pending or accepted)
    const activeBookings = await Booking.find({
      date,
      status: { $in: ['pending', 'accepted'] }
    }).select('timeSlot status serviceId');

    const bookedSlots = activeBookings.map((b) => b.timeSlot);

    const slotStatus = FIXED_SLOTS.map((slot) => {
      const isBooked = bookedSlots.includes(slot);
      return {
        slot,
        isAvailable: !isBooked,
        status: isBooked ? 'booked' : 'available'
      };
    });

    const availableSlots = slotStatus
      .filter((s) => s.isAvailable)
      .map((s) => s.slot);

    res.status(200).json({
      success: true,
      date,
      allSlots: FIXED_SLOTS,
      availableSlots,
      slotStatus
    });
  } catch (error) {
    console.error('Slot Availability Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching available slots.'
    });
  }
};

module.exports = {
  FIXED_SLOTS,
  getAvailableSlots
};
