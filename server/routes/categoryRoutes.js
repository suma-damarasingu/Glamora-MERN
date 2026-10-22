const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public: View categories
router.get('/', getCategories);

// Admin Only: Add, Edit, Delete
router.post('/', verifyToken, requireAdmin, upload.single('image'), createCategory);
router.put('/:id', verifyToken, requireAdmin, upload.single('image'), updateCategory);
router.delete('/:id', verifyToken, requireAdmin, deleteCategory);

module.exports = router;
