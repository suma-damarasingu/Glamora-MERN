const Service = require('../models/Service');
const Category = require('../models/Category');
const { uploadToCloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const fs = require('fs');

/**
 * @route   GET /api/services
 * @desc    Get all active services (or all if admin)
 */
const getServices = async (req, res) => {
  try {
    const { category, search, all } = req.query;
    const filter = {};

    // If 'all' is not explicitly requested, show only active services for customers
    if (all !== 'true') {
      filter.isActive = true;
    }

    if (category && category !== 'all') {
      filter.categoryId = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const services = await Service.find(filter)
      .populate('categoryId', 'name image')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      services
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   GET /api/services/:id
 * @desc    Get single service by ID
 */
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('categoryId', 'name image');
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.status(200).json({ success: true, service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   POST /api/services
 * @desc    Create service (Admin only)
 */
const createService = async (req, res) => {
  try {
    const { name, categoryId, price, description, duration, isActive } = req.body;
    let image = req.body.image;

    if (!name || !categoryId || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, Category, and Price are required.'
      });
    }

    // Verify category exists
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Selected category does not exist.'
      });
    }

    if (req.file) {
      if (isCloudinaryConfigured) {
        image = await uploadToCloudinary(req.file.path, 'services');
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      } else {
        image = `/uploads/${req.file.filename}`;
      }
    }

    if (!image) {
      image = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80';
    }

    const service = await Service.create({
      name: name.trim(),
      categoryId,
      price: Number(price),
      description: description || '',
      duration: duration || '45 mins',
      image,
      isActive: isActive !== undefined ? isActive === 'true' || isActive === true : true
    });

    const populatedService = await Service.findById(service._id).populate('categoryId', 'name');

    res.status(201).json({
      success: true,
      message: 'Service created successfully!',
      service: populatedService
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   PUT /api/services/:id
 * @desc    Update service (Admin only)
 */
const updateService = async (req, res) => {
  try {
    const { name, categoryId, price, description, duration, isActive } = req.body;
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    if (name) service.name = name.trim();
    if (categoryId) {
      const categoryExists = await Category.findById(categoryId);
      if (!categoryExists) {
        return res.status(400).json({ success: false, message: 'Invalid category' });
      }
      service.categoryId = categoryId;
    }
    if (price !== undefined) service.price = Number(price);
    if (description !== undefined) service.description = description;
    if (duration !== undefined) service.duration = duration;
    if (isActive !== undefined) {
      service.isActive = isActive === 'true' || isActive === true;
    }

    if (req.file) {
      let image = null;
      if (isCloudinaryConfigured) {
        image = await uploadToCloudinary(req.file.path, 'services');
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      } else {
        image = `/uploads/${req.file.filename}`;
      }
      if (image) service.image = image;
    } else if (req.body.image) {
      service.image = req.body.image;
    }

    await service.save();
    const updated = await Service.findById(service._id).populate('categoryId', 'name');

    res.status(200).json({
      success: true,
      message: 'Service updated successfully!',
      service: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   DELETE /api/services/:id
 * @desc    Delete service (Admin only)
 */
const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    await Service.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully!'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService
};
