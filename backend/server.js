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

// Database Connection
const Message = require('./models/Message');
const mongooseOptions = {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 15000,
    family: 4, // Force IPv4
};

// Connect to MongoDB
let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    try {
        await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
        isConnected = true;
        console.log('✅ Connected to MongoDB Atlas!');
    } catch (err) {
        console.error('❌ MongoDB Connection ERROR:', err.message);
    }
};

// Middleware to ensure DB connection for Vercel
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// Paths
const frontendPath = path.join(__dirname, '../frontend');
const pagesPath = path.join(frontendPath, 'pages');
const adminPath = path.join(frontendPath, 'admin');

// Specific static routes for predictable asset loading
app.use('/admin', express.static(adminPath));
app.use('/css', express.static(path.join(pagesPath, 'css')));
app.use('/js', express.static(path.join(pagesPath, 'js')));
app.use('/images', express.static(path.join(pagesPath, 'images')));

// Redirect root to pages/index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(pagesPath, 'index.html'));
});

// Serve everything else from pages (public HTML files, videos etc)
app.use(express.static(pagesPath));

// Serve uploaded gallery images
app.use('/uploads', express.static(path.join(frontendPath, 'uploads')));

// Export for Vercel
module.exports = app;

// Start server ONLY if not running on Vercel
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`\n🚀 Matoshree Nursery Server is LIVE!`);
            console.log(`🔗 Click to visit: http://localhost:${PORT}`);
        });
    });
}

mongoose.connection.on('error', err => {
    console.error('Mongoose connection error: ' + err.message);
});

mongoose.connection.on('disconnected', () => {
    console.log('⚠️  MongoDB disconnected');
});

