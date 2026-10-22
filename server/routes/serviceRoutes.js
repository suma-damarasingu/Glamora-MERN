const express = require('express');
const router = express.Router();
const {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} = require('../controllers/serviceController');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public: View all or single service
router.get('/', getServices);
router.get('/:id', getServiceById);

// Admin Only: Add, Edit, Delete
router.post('/', verifyToken, requireAdmin, upload.single('image'), createService);
router.put('/:id', verifyToken, requireAdmin, upload.single('image'), updateService);
router.delete('/:id', verifyToken, requireAdmin, deleteService);

module.exports = router;
