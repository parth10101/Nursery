const mongoose = require('mongoose');

const galleryImageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  filename: { type: String, required: true },   // stored file name on disk
  url: { type: String, required: true },         // public URL path
}, { timestamps: true });

module.exports = mongoose.model('GalleryImage', galleryImageSchema);
