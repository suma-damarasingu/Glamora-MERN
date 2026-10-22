const express = require('express');
const router = express.Router();
const { getAvailableSlots } = require('../controllers/slotController');

// Public / Authenticated: Check available slots for a given date
router.get('/available', getAvailableSlots);

module.exports = router;
