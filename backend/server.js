const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const messageRoutes = require('./routes/messageRoutes');
const galleryRoutes = require('./routes/galleryRoutes');

app.use('/api/auth', authRoutes);

// Connectivity Diagnostic: Log all incoming product data
app.use('/api/products', (req, res, next) => {
    if (['POST', 'PUT'].includes(req.method)) {
        console.log(`[CONNECTIVITY LOG] ${req.method} /api/products | Name: ${req.body?.name} | Desc Received: ${!!req.body?.description}`);
    }
    next();
}, productRoutes);

app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/gallery', galleryRoutes);

// Redirect root to pages/index.html
app.get('/', (req, res) => {
    res.redirect('/pages/index.html');
});

// Serve uploaded gallery images
app.use('/uploads', express.static(path.join(__dirname, '../frontend/uploads')));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Database Connection — connect first, then start server
const Message = require('./models/Message');
const mongooseOptions = {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 15000,
    family: 4, // Force IPv4
};

mongoose.connect(process.env.MONGODB_URI, mongooseOptions)
  .then(async () => {
      console.log('✅ Connected to MongoDB Atlas!');
      const msgCount = await Message.countDocuments();
      console.log(`📊 DB initialized with ${msgCount} customer messages.`);

      // Start the server ONLY after DB is connected
      app.listen(PORT, () => {
          console.log(`\n🚀 Matoshree Nursery Server is LIVE!`);
          console.log(`🔗 Click to visit: http://localhost:${PORT}`);
          console.log(`\nPress Ctrl + C to stop the server\n`);
      });
  })
  .catch(err => {
      console.error('❌ MongoDB Connection ERROR:', err.message);
      if (err.message.includes('SSL') || err.message.includes('ENOTFOUND') || err.message.includes('timed out')) {
          console.log('\n💡 TIP: Your IP may not be whitelisted in MongoDB Atlas.');
          console.log('Go to Atlas > Network Access > Add Current IP Address\n');
      }
      process.exit(1);
  });

mongoose.connection.on('error', err => {
    console.error('Mongoose connection error: ' + err.message);
});

mongoose.connection.on('disconnected', () => {
    console.log('⚠️  MongoDB disconnected');
});

