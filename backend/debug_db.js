const mongoose = require('mongoose');
require('dotenv').config();

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema, 'products');

async function debugDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");
        const products = await Product.find({}).limit(5);
        console.log("Found products:", JSON.stringify(products, null, 2));
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

debugDB();
