const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  discount: { type: Number },
  stock: { 
    type: Number, 
    required: true, 
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  category: { type: String, required: true },
  description: { 
    type: String, 
    required: [true, 'Description is mandatory for every plant'],
    default: ""
  },
  imageUrl: { type: String, required: true },
  rating: { type: Number, default: 5.0 },
  reviews: { type: Number, default: 0 }
}, { timestamps: true });

// Deep Enforcement Hook: Failsafe against 'undefined' or missing fields
productSchema.pre('save', async function() {
  if (this.description === undefined || this.description === null) {
    this.description = ""; // Force fallback
  }
  console.log(`[DB HOOK] Saving Product: ${this.name} | Desc Length: ${this.description ? this.description.length : 0}`);
});

module.exports = mongoose.model('Product', productSchema);
