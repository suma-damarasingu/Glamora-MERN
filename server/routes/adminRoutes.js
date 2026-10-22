const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/adminController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Admin Analytics Dashboard Data (Feature #1)
router.get('/analytics', verifyToken, requireAdmin, getAnalytics);

module.exports = router;
