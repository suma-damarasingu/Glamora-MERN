const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive']
    },
    description: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      required: [true, 'Service image is required'],
      default: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80'
    },
    duration: {
      type: String,
      default: '60 mins'
    },
    durationMinutes: {
      type: Number,
      default: 60
    },
    startTime: {
      type: String,
      default: '09:00 AM'
    },
    endTime: {
      type: String,
      default: '08:00 PM'
    },
    slots: {
      type: [String],
      default: [
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
      ]
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Service', serviceSchema);
