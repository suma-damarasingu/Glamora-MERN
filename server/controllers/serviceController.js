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

function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 540;
  const [time, modifier] = timeStr.trim().split(' ');
  let [hours, minutes] = (time || '09:00').split(':').map(Number);
  if (hours === 12) hours = 0;
  if (modifier === 'PM') hours += 12;
  return hours * 60 + (minutes || 0);
}

function formatMinutesToTime(totalMinutes) {
  let hours24 = Math.floor(totalMinutes / 60);
  let minutes = totalMinutes % 60;
  let modifier = hours24 >= 12 ? 'PM' : 'AM';
  let hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return String(hours12).padStart(2, '0') + ':' + String(minutes).padStart(2, '0') + ' ' + modifier;
}

function generateTimeSlots(startStr, endStr, durMinutes) {
  const start = parseTimeToMinutes(startStr);
  const end = parseTimeToMinutes(endStr);
  const duration = Number(durMinutes) || 60;
  const result = [];
  for (let m = start; m + duration <= end; m += duration) {
    result.push(formatMinutesToTime(m));
  }
  return result.length > 0 ? result : ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM', '05:00 PM'];
}

function parseSlotsInput(slots) {
  if (!slots) return null;
  if (Array.isArray(slots)) return slots.map((s) => String(s).trim()).filter(Boolean);
  if (typeof slots === 'string') {
    try {
      const parsed = JSON.parse(slots);
      if (Array.isArray(parsed)) return parsed.map((s) => String(s).trim()).filter(Boolean);
    } catch (e) {
      return slots.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return null;
}

/**
 * @route   POST /api/services
 * @desc    Create service (Admin only)
 */
const createService = async (req, res) => {
  try {
    const {
      name,
      categoryId,
      price,
      description,
      duration,
      durationMinutes,
      startTime,
      endTime,
      slots,
      isActive
    } = req.body;
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

    const durMin = durationMinutes ? Number(durationMinutes) : 60;
    const finalStartTime = startTime || '09:00 AM';
    const finalEndTime = endTime || '08:00 PM';
    const parsedSlots = parseSlotsInput(slots);
    const finalSlots = (parsedSlots && parsedSlots.length > 0)
      ? parsedSlots
      : generateTimeSlots(finalStartTime, finalEndTime, durMin);

    const service = await Service.create({
      name: name.trim(),
      categoryId,
      price: Number(price),
      description: description || '',
      duration: duration || `${durMin} mins`,
      durationMinutes: durMin,
      startTime: finalStartTime,
      endTime: finalEndTime,
      slots: finalSlots,
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
    const {
      name,
      categoryId,
      price,
      description,
      duration,
      durationMinutes,
      startTime,
      endTime,
      slots,
      isActive
    } = req.body;
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
    if (durationMinutes !== undefined) {
      service.durationMinutes = Number(durationMinutes);
      if (!duration) service.duration = `${durationMinutes} mins`;
    }
    if (startTime) service.startTime = startTime;
    if (endTime) service.endTime = endTime;

    const parsedSlots = parseSlotsInput(slots);
    if (parsedSlots && parsedSlots.length > 0) {
      service.slots = parsedSlots;
    } else if (startTime && endTime) {
      service.slots = generateTimeSlots(service.startTime, service.endTime, service.durationMinutes || 60);
    }

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
