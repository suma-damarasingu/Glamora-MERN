const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },
    date: {
      type: String, // Stored as YYYY-MM-DD
      required: [true, 'Booking date is required']
    },
    timeSlot: {
      type: String, // e.g., '10:00 AM'
      required: [true, 'Time slot is required']
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    notes: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'completed', 'cancelled'],
      default: 'pending'
    },
    price: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for faster lookups and conflict checking
bookingSchema.index({ date: 1, timeSlot: 1, status: 1 });
bookingSchema.index({ userId: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
