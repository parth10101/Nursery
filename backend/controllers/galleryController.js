const GalleryImage = require('../models/GalleryImage');
const path = require('path');
const fs = require('fs');

// @desc  Get all gallery images
// @route GET /api/gallery
// @access Public
const getGalleryImages = async (req, res) => {
  try {
    const images = await GalleryImage.find().sort({ createdAt: -1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Upload a gallery image
// @route POST /api/gallery
// @access Admin
const uploadGalleryImage = async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: 'Image URL is required' });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const image = await GalleryImage.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      filename: imageUrl.split('/').pop(),
      url: imageUrl,
    });

    res.status(201).json(image);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Delete a gallery image
// @route DELETE /api/gallery/:id
// @access Admin
const deleteGalleryImage = async (req, res) => {
  try {
    const image = await GalleryImage.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Image resides on Cloudinary now, so we only remove the database reference
    await GalleryImage.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Image deleted from gallery successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getGalleryImages, uploadGalleryImage, deleteGalleryImage };
