const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Database Connection (cached for Vercel serverless) ───────────────────────
let isConnected = false;

const connectDB = async () => {
    if (isConnected && mongoose.connection.readyState === 1) return;
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('❌ MONGODB_URI is not defined! Add it in Vercel Environment Variables.');
        return;
    }
    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 15000,
            connectTimeoutMS:         20000,
            socketTimeoutMS:          45000,
            family:                   4,
            retryWrites:              true,
        });
        isConnected = true;
        console.log('✅ Connected to MongoDB Atlas!');
    } catch (err) {
        isConnected = false;
        console.error('❌ MongoDB Connection ERROR:', err.message);
    }
};

// ─── DB Middleware — MUST be first so all API routes have a DB connection ──────
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// ─── General Middleware ───────────────────────────────────────────────────────
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        dbState: mongoose.connection.readyState,
        dbConnected: isConnected,
        mongoUri: process.env.MONGODB_URI ? 'defined ✅' : 'MISSING ❌ — Add MONGODB_URI in Vercel env vars'
    });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
const authRoutes    = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes   = require('./routes/orderRoutes');
const messageRoutes = require('./routes/messageRoutes');
const galleryRoutes = require('./routes/galleryRoutes');

app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/gallery',  galleryRoutes);

// ─── Static File Serving ──────────────────────────────────────────────────────
const frontendPath = path.join(__dirname, '../frontend');
const pagesPath    = path.join(frontendPath, 'pages');
const adminPath    = path.join(frontendPath, 'admin');

app.use('/uploads', express.static(path.join(frontendPath, 'uploads')));
app.use('/admin',   express.static(adminPath));
app.use('/css',     express.static(path.join(pagesPath, 'css')));
app.use('/js',      express.static(path.join(pagesPath, 'js')));
app.use('/images',  express.static(path.join(pagesPath, 'images')));

app.get('/', (req, res) => {
    res.sendFile(path.join(pagesPath, 'index.html'));
});

// Serve static pages directory (plants.html, login.html, etc.)
app.use(express.static(pagesPath));

// ─── Catch-all: unmatched routes → index.html ─────────────────────────────────
app.use((req, res) => {
    res.sendFile(path.join(pagesPath, 'index.html'));
});

// ─── Mongoose Events ──────────────────────────────────────────────────────────
mongoose.connection.on('error', err => {
    console.error('Mongoose error:', err.message);
    isConnected = false;
});
mongoose.connection.on('disconnected', () => {
    console.log('⚠️  MongoDB disconnected');
    isConnected = false;
});

// ─── Export for Vercel ────────────────────────────────────────────────────────
module.exports = app;

// ─── Local Dev ────────────────────────────────────────────────────────────────
if (!process.env.VERCEL) {
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`\n🚀 Server running at http://localhost:${PORT}`);
        });
    });
}
