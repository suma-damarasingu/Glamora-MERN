const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
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
    }
  },
  {
    timestamps: true
  }
);

favoriteSchema.index({ userId: 1, serviceId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
