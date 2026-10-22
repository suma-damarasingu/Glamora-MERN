const Booking = require('../models/Booking');
const User = require('../models/User');
const Service = require('../models/Service');
const Category = require('../models/Category');

/**
 * @route   GET /api/admin/analytics
 * @desc    Get comprehensive analytics for admin dashboard (Feature #1)
 */
const getAnalytics = async (req, res) => {
  try {
    // 1. Core Counts
    const totalBookings = await Booking.countDocuments();
    const pendingCount = await Booking.countDocuments({ status: 'pending' });
    const acceptedCount = await Booking.countDocuments({ status: 'accepted' });
    const declinedCount = await Booking.countDocuments({ status: 'declined' });
    const completedCount = await Booking.countDocuments({ status: 'completed' });
    const cancelledCount = await Booking.countDocuments({ status: 'cancelled' });

    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalServices = await Service.countDocuments();
    const totalCategories = await Category.countDocuments();

    // 2. Revenue calculation (sum of completed bookings)
    const revenueAgg = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$price' } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    // 3. Line Chart Data: Bookings per day for the last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const displayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      last7Days.push({ dateStr, label: displayLabel });
    }

    const bookingsLast7Days = await Promise.all(
      last7Days.map(async ({ dateStr, label }) => {
        const count = await Booking.countDocuments({ date: dateStr });
        const dayRev = await Booking.aggregate([
          { $match: { date: dateStr, status: 'completed' } },
          { $group: { _id: null, rev: { $sum: '$price' } } }
        ]);
        return {
          date: label,
          bookings: count,
          revenue: dayRev.length > 0 ? dayRev[0].rev : 0
        };
      })
    );

    // 4. Pie Chart Data: Booking status distribution
    const statusDistribution = [
      { name: 'Pending', value: pendingCount, color: '#f59e0b' },
      { name: 'Accepted', value: acceptedCount, color: '#10b981' },
      { name: 'Completed', value: completedCount, color: '#0ea5e9' },
      { name: 'Declined', value: declinedCount, color: '#f43f5e' },
      { name: 'Cancelled', value: cancelledCount, color: '#94a3b8' }
    ].filter((item) => item.value > 0);

    // If all are 0, supply default placeholder item for clean visual
    if (statusDistribution.length === 0) {
      statusDistribution.push({ name: 'No Bookings Yet', value: 1, color: '#e2e8f0' });
    }

    // 5. Bar Chart Data: Top 5 most-booked services
    const topServicesAgg = await Booking.aggregate([
      { $group: { _id: '$serviceId', count: { $sum: 1 }, totalRevenue: { $sum: '$price' } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const topServices = await Promise.all(
      topServicesAgg.map(async (item) => {
        const service = await Service.findById(item._id).select('name price');
        return {
          name: service ? service.name : 'Unknown Service',
          bookings: item.count,
          price: service ? service.price : 0
        };
      })
    );

    // 6. Recent bookings
    const recentBookings = await Booking.find()
      .populate('userId', 'name email profilePic')
      .populate('serviceId', 'name price image')
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      stats: {
        totalBookings,
        pendingCount,
        acceptedCount,
        declinedCount,
        completedCount,
        cancelledCount,
        totalRevenue,
        totalCustomers,
        totalServices,
        totalCategories
      },
      charts: {
        bookingsLast7Days,
        statusDistribution,
        topServices
      },
      recentBookings
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error generating analytics.' });
  }
};

/**
 * @route   GET /api/users
 * @desc    Get all customers with their booking histories (Admin only)
 */
const getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' })
      .select('-password -otp -otpExpiry')
      .sort({ createdAt: -1 });

    const customersWithHistory = await Promise.all(
      customers.map(async (customer) => {
        const bookings = await Booking.find({ userId: customer._id })
          .populate('serviceId', 'name price image duration')
          .sort({ createdAt: -1 });

        const totalSpent = bookings
          .filter((b) => b.status === 'completed')
          .reduce((sum, b) => sum + (b.price || 0), 0);

        return {
          ...customer.toObject(),
          totalBookings: bookings.length,
          totalSpent,
          bookings
        };
      })
    );

    res.status(200).json({
      success: true,
      customers: customersWithHistory
    });
  } catch (error) {
    console.error('Get Customers Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAnalytics,
  getCustomers
};
