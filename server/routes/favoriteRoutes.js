const express = require('express');
const router = express.Router();
const { toggleFavorite, getFavorites } = require('../controllers/favoriteController');
const { verifyToken, requireCustomer } = require('../middleware/auth');

router.post('/:serviceId', verifyToken, requireCustomer, toggleFavorite);
router.get('/', verifyToken, requireCustomer, getFavorites);

module.exports = router;
