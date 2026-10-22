const Booking = require('../models/Booking');
const Service = require('../models/Service');

// Fixed default salon time slots
const FIXED_SLOTS = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
  '07:00 PM'
];

/**
 * @route   GET /api/slots/available
 * @desc    Get slot availability for a given date and service
 * @query   date (YYYY-MM-DD), serviceId (optional)
 */
const getAvailableSlots = async (req, res) => {
  try {
    const { date, serviceId } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required (YYYY-MM-DD).'
      });
    }

    let serviceSlots = FIXED_SLOTS;
    let serviceDuration = '60 mins';

    if (serviceId) {
      try {
        const service = await Service.findById(serviceId);
        if (service) {
          if (Array.isArray(service.slots) && service.slots.length > 0) {
            serviceSlots = service.slots;
          }
          if (service.duration) {
            serviceDuration = service.duration;
          }
        }
      } catch (err) {
        console.warn('Could not fetch service slots by ID:', err.message);
      }
    }

    // Find bookings on this date that occupy a slot (pending or accepted)
    const bookingQuery = {
      date,
      status: { $in: ['pending', 'accepted'] }
    };
    if (serviceId) {
      bookingQuery.serviceId = serviceId;
    }

    const activeBookings = await Booking.find(bookingQuery).select('timeSlot status serviceId');
    const bookedSlots = activeBookings.map((b) => b.timeSlot);

    const slotStatus = serviceSlots.map((slot) => {
      const isBooked = bookedSlots.includes(slot);
      return {
        id: slot,
        time: slot,
        slot,
        isAvailable: !isBooked,
        isBooked,
        status: isBooked ? 'booked' : 'available'
      };
    });

    const availableSlots = slotStatus
      .filter((s) => s.isAvailable)
      .map((s) => s.slot);

    res.status(200).json({
      success: true,
      date,
      serviceId: serviceId || null,
      serviceDuration,
      allSlots: serviceSlots,
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
