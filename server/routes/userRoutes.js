const express = require('express');
const router = express.Router();
const { getCustomers } = require('../controllers/adminController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Admin: View all registered customers & booking history
router.get('/', verifyToken, requireAdmin, getCustomers);

module.exports = router;
