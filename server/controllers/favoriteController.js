const Favorite = require('../models/Favorite');
const Service = require('../models/Service');

/**
 * @route   POST /api/favorites/:serviceId
 * @desc    Toggle a service in user favorites
 */
const toggleFavorite = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const userId = req.user._id;

    // Check service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    const existing = await Favorite.findOne({ userId, serviceId });

    if (existing) {
      await Favorite.findByIdAndDelete(existing._id);
      return res.status(200).json({
        success: true,
        isFavorited: false,
        message: 'Removed from favorites.'
      });
    } else {
      await Favorite.create({ userId, serviceId });
      return res.status(201).json({
        success: true,
        isFavorited: true,
        message: 'Added to favorites! ❤️'
      });
    }
  } catch (error) {
    console.error('Toggle Favorite Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   GET /api/favorites
 * @desc    Get user's favorites list
 */
const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.user._id })
      .populate({
        path: 'serviceId',
        populate: {
          path: 'categoryId',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });

    // Filter out any where service might have been deleted
    const validFavorites = favorites.filter((f) => f.serviceId !== null);

    res.status(200).json({
      success: true,
      favorites: validFavorites
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  toggleFavorite,
  getFavorites
};
