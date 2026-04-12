require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function repair() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to DB for repair');

    // 1. Find all products missing the description field
    const products = await Product.find({ 
      $or: [
        { description: { $exists: false } },
        { description: null },
        { description: "" }
      ]
    });

    console.log(`🔍 Found ${products.length} products needing repair.`);

    for (let p of products) {
      // Use the name as a temporary description if it's a "Mango" long name, 
      // otherwise use a professional placeholder.
      let placeholder = "High-quality plant from Matoshree Nursery. Nurtured with care and ready for your garden.";
      
      if (p.name.length > 50) {
        placeholder = p.name; // Keep the user's "accidental" description in the name
      }

      p.description = placeholder;
      await p.save();
      console.log(`   🛠️ Repaired: ${p.name}`);
    }

    console.log('✨ All products repaired and descriptions enforced!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Repair Failed:', err);
    process.exit(1);
  }
}

repair();
