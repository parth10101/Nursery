const express = require('express');
const router = express.Router();
const { getGalleryImages, uploadGalleryImage, deleteGalleryImage } = require('../controllers/galleryController');
const { protect, admin } = require('../middleware/authMiddleware');

// Routes
router.get('/', getGalleryImages);
// The frontend directly hits Cloudinary. This POST simply captures the returned secure_url.
router.post('/', protect, admin, uploadGalleryImage);
router.delete('/:id', protect, admin, deleteGalleryImage);

module.exports = router;
