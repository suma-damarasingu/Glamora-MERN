const Booking = require('../models/Booking');
const Favorite = require('../models/Favorite');
const Service = require('../models/Service');

/**
 * @route   GET /api/recommendations
 * @desc    Get personalized smart recommendations for customer (Feature #3)
 */
const getRecommendations = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    let recommendedServices = [];
    let reason = 'Trending & Most Loved Services';

    if (userId) {
      // 1. Check user bookings history
      const userBookings = await Booking.find({ userId })
        .populate('serviceId', 'categoryId')
        .select('serviceId');

      if (userBookings.length > 0) {
        // Count category frequency
        const categoryCounts = {};
        userBookings.forEach((b) => {
          if (b.serviceId && b.serviceId.categoryId) {
            const catId = b.serviceId.categoryId.toString();
            categoryCounts[catId] = (categoryCounts[catId] || 0) + 1;
          }
        });

        const sortedCategoryIds = Object.keys(categoryCounts).sort(
          (a, b) => categoryCounts[b] - categoryCounts[a]
        );

        if (sortedCategoryIds.length > 0) {
          // Get services from these top categories
          recommendedServices = await Service.find({
            categoryId: { $in: sortedCategoryIds },
            isActive: true
          })
            .populate('categoryId', 'name')
            .limit(4);

          reason = 'Tailored to your past bookings & preferences';
        }
      }

      // 2. If no bookings or fewer than 4, check user favorites
      if (recommendedServices.length < 4) {
        const userFavorites = await Favorite.find({ userId })
          .populate('serviceId', 'categoryId')
          .select('serviceId');

        if (userFavorites.length > 0) {
          const favoriteCategoryIds = userFavorites
            .filter((f) => f.serviceId && f.serviceId.categoryId)
            .map((f) => f.serviceId.categoryId.toString());

          const favoriteCatServices = await Service.find({
            categoryId: { $in: favoriteCategoryIds },
            isActive: true,
            _id: { $nin: recommendedServices.map((s) => s._id) }
          })
            .populate('categoryId', 'name')
            .limit(4 - recommendedServices.length);

          recommendedServices = [...recommendedServices, ...favoriteCatServices];
          if (!userBookings.length) {
            reason = 'Inspired by your favorite categories';
          }
        }
      }
    }

    // 3. Fallback for new user or if fewer than 4: Trending services (most booked overall)
    if (recommendedServices.length < 4) {
      const trendingAgg = await Booking.aggregate([
        { $group: { _id: '$serviceId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 }
      ]);

      const trendingServiceIds = trendingAgg.map((t) => t._id);

      const trendingServices = await Service.find({
        _id: {
          $in: trendingServiceIds,
          $nin: recommendedServices.map((s) => s._id)
        },
        isActive: true
      })
        .populate('categoryId', 'name')
        .limit(4 - recommendedServices.length);

      recommendedServices = [...recommendedServices, ...trendingServices];

      // If still fewer than 4 (e.g. brand new DB without bookings), fill with top active services
      if (recommendedServices.length < 4) {
        const defaultServices = await Service.find({
          _id: { $nin: recommendedServices.map((s) => s._id) },
          isActive: true
        })
          .populate('categoryId', 'name')
          .limit(4 - recommendedServices.length);

        recommendedServices = [...recommendedServices, ...defaultServices];
      }

      if (recommendedServices.length > 0 && !userId) {
        reason = 'Trending & Popular on Glamora';
      }
    }

    res.status(200).json({
      success: true,
      reason,
      recommendations: recommendedServices
    });
  } catch (error) {
    console.error('Recommendations Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getRecommendations
};
