const Booking = require('../models/Booking');
const Service = require('../models/Service');
const { FIXED_SLOTS } = require('./slotController');

/**
 * @route   POST /api/bookings
 * @desc    Customer creates a booking with slot conflict check
 */
const createBooking = async (req, res) => {
  try {
    const { serviceId, date, timeSlot, address, notes } = req.body;

    if (!serviceId || !date || !timeSlot || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide service, date, time slot, and address.'
      });
    }

    // Validate that slot is one of the valid fixed slots
    if (!FIXED_SLOTS.includes(timeSlot)) {
      return res.status(400).json({
        success: false,
        message: `Invalid time slot. Allowed slots: ${FIXED_SLOTS.join(', ')}`
      });
    }

    // Verify service exists and is active
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }
    if (!service.isActive) {
      return res.status(400).json({ success: false, message: 'This service is currently unavailable.' });
    }

    // ⭐ FEATURE #2: SLOT CONFLICT DETECTION (Customer Side)
    // Check if slot is already occupied by an active booking (pending or accepted)
    const existingConflict = await Booking.findOne({
      date,
      timeSlot,
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingConflict) {
      return res.status(409).json({
        success: false,
        message: `Slot already booked! The time slot "${timeSlot}" on ${date} is no longer available. Please pick another time slot.`
      });
    }

    const booking = await Booking.create({
      userId: req.user._id,
      serviceId,
      date,
      timeSlot,
      address: address.trim(),
      notes: notes ? notes.trim() : '',
      status: 'pending',
      price: service.price
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('serviceId', 'name image duration price categoryId')
      .populate('userId', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Booking placed successfully! Waiting for salon confirmation.',
      booking: populatedBooking
    });
  } catch (error) {
    console.error('Create Booking Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error creating booking.' });
  }
};

/**
 * @route   GET /api/bookings/my
 * @desc    Get bookings for authenticated customer
 */
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate({
        path: 'serviceId',
        select: 'name price image duration categoryId',
        populate: {
          path: 'categoryId',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      bookings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   PUT /api/bookings/:id/cancel
 * @desc    Customer cancels their pending booking
 */
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a booking that is already ${booking.status}.`
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully.',
      booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   GET /api/bookings
 * @desc    Get all bookings (Admin only) with optional status filter
 */
const getAllBookings = async (req, res) => {
  try {
    const { status, date } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (date) {
      filter.date = date;
    }

    const bookings = await Booking.find(filter)
      .populate('userId', 'name email phone profilePic')
      .populate({
        path: 'serviceId',
        select: 'name price image duration categoryId',
        populate: {
          path: 'categoryId',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      bookings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   PUT /api/bookings/:id/status
 * @desc    Update booking status (Admin: accept, decline, completed)
 * ⭐ FEATURE #2: Admin side slot conflict detection
 */
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['accepted', 'declined', 'completed', 'pending'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // ⭐ FEATURE #2: SLOT CONFLICT DETECTION ON ACCEPT
    // If admin is accepting this booking, ensure no OTHER booking for the same date & slot is already accepted
    if (status === 'accepted') {
      const conflictBooking = await Booking.findOne({
        _id: { $ne: booking._id },
        date: booking.date,
        timeSlot: booking.timeSlot,
        status: 'accepted'
      }).populate('userId', 'name');

      if (conflictBooking) {
        return res.status(409).json({
          success: false,
          message: `Slot Conflict: Time slot "${booking.timeSlot}" on ${booking.date} is already booked and accepted for client "${conflictBooking.userId?.name || 'Another Client'}". Cannot accept duplicate booking.`
        });
      }
    }

    booking.status = status;
    await booking.save();

    const updated = await Booking.findById(booking._id)
      .populate('userId', 'name email phone')
      .populate('serviceId', 'name price image duration');

    res.status(200).json({
      success: true,
      message: `Booking has been marked as ${status}.`,
      booking: updated
    });
  } catch (error) {
    console.error('Update Booking Status Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings,
  updateBookingStatus
};
