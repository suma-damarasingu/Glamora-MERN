const Category = require('../models/Category');
const Service = require('../models/Service');
const { uploadToCloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const fs = require('fs');

/**
 * @route   GET /api/categories
 * @desc    Get all categories with service counts
 */
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    // Attach service count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Service.countDocuments({ categoryId: cat._id });
        return {
          ...cat.toObject(),
          serviceCount: count
        };
      })
    );

    res.status(200).json({
      success: true,
      categories: categoriesWithCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   POST /api/categories
 * @desc    Create a category (Admin only)
 */
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    let image = req.body.image;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    // Check duplicate
    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A category with this name already exists' });
    }

    if (req.file) {
      if (isCloudinaryConfigured) {
        image = await uploadToCloudinary(req.file.path, 'categories');
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      } else {
        image = `/uploads/${req.file.filename}`;
      }
    }

    if (!image) {
      image = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80';
    }

    const category = await Category.create({
      name: name.trim(),
      description: description || '',
      image
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully!',
      category
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category (Admin only)
 */
const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (name) category.name = name.trim();
    if (description !== undefined) category.description = description;

    if (req.file) {
      let image = null;
      if (isCloudinaryConfigured) {
        image = await uploadToCloudinary(req.file.path, 'categories');
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      } else {
        image = `/uploads/${req.file.filename}`;
      }
      if (image) category.image = image;
    } else if (req.body.image) {
      category.image = req.body.image;
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully!',
      category
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category (Admin only)
 */
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Check if services are attached
    const serviceCount = await Service.countDocuments({ categoryId: category._id });
    if (serviceCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It still has ${serviceCount} service(s) attached. Delete or reassign them first.`
      });
    }

    await Category.findByIdAndDelete(category._id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully!'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
