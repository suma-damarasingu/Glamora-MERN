const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommendationController');
const { verifyToken } = require('../middleware/auth');

// Customer / Public: Get smart recommendations (Feature #3)
// Optional token check: if user logged in, use their personalized history; else show trending
router.get('/', (req, res, next) => {
  if (req.headers.authorization) {
    return verifyToken(req, res, next);
  }
  next();
}, getRecommendations);

module.exports = router;
