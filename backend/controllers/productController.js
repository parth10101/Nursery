const Product = require('../models/Product');

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single product
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create product
const createProduct = async (req, res) => {
  try {
    const { name, price, stock, category, description, imageUrl } = req.body;
    
    // Diagnostic: Check if description is missing from the request keys
    if (description === undefined || description === null) {
      const keys = Object.keys(req.body);
      console.error("CRITICAL: Incoming description is missing! Keys received:", keys);
      return res.status(400).json({ 
        message: `Description is required. Received keys: [${keys.join(', ')}]` 
      });
    }

    const product = new Product({ 
      name, 
      price, 
      stock, 
      category, 
      description, 
      imageUrl 
    });
    
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { name, price, stock, category, description, imageUrl } = req.body;

    // Diagnostic: Check if description is missing from the update keys
    if (description === undefined || description === null) {
      const keys = Object.keys(req.body);
      console.error("CRITICAL: Update description is missing! Keys received:", keys);
      return res.status(400).json({ 
        message: `Description is required for updates. Received keys: [${keys.join(', ')}]` 
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      { 
        name, 
        price, 
        stock, 
        category, 
        description, 
        imageUrl 
      }, 
      { new: true, runValidators: true }
    );
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (product) {
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
