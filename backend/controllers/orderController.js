const Order = require('../models/Order');
const Product = require('../models/Product');

// Create new order
const addOrderItems = async (req, res) => {
  const { items, totalAmount, customerDetails } = req.body;

  if (items && items.length === 0) {
    res.status(400).json({ message: 'No order items' });
    return;
  } else {
    try {
      // 1. Pre-validation Phase: Ensure all items exist and have sufficient stock
      for (const item of items) {
        const qty = item.qty || item.quantity;
        const productId = item.id || item._id;
        const product = await Product.findById(productId);
        
        if (!product) {
          return res.status(404).json({ message: `Product ${item.name} not found.` });
        }
        if (product.stock < qty) {
          return res.status(400).json({ 
            message: `Insufficient stock for ${product.name}. Only ${product.stock} available.` 
          });
        }
      }

      // 2. Atomic Deduction Phase: Use $inc with a safety filter to prevent negative stock (minus products)
      for (const item of items) {
        const qty = item.qty || item.quantity;
        const productId = item.id || item._id;
        
        // Atomically decrement ONLY if result is >= 0
        const updateResult = await Product.updateOne(
          { _id: productId, stock: { $gte: qty } },
          { $inc: { stock: -qty } }
        );

        if (updateResult.modifiedCount === 0) {
          throw new Error(`Insufficient stock for ${item.name}.`);
        }
      }

      // 3. Save the actual order
      const order = new Order({
        items: items.map(item => ({
          id: item.id || item._id,
          name: item.name,
          price: item.price,
          quantity: item.qty || item.quantity,
          imageUrl: item.imageUrl
        })),
        userId: req.user._id,
        totalAmount,
        customerDetails
      });

      const createdOrder = await order.save();

      res.status(201).json(createdOrder);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

// Get logged in user orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders (admin)
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('userId', 'id email');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.status = req.body.status;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addOrderItems, getMyOrders, getOrders, updateOrderStatus };
