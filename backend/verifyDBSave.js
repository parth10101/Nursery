require('dotenv').config();
const mongoose = require('mongoose');
const Message = require('./models/Message');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('🔗 Successfully connected to MongoDB Atlas.');
    
    // Create a test message
    const testMsg = await Message.create({
        name: "Verification Bot",
        email: "bot@test.com",
        phone: "0000000000",
        message: "This is an automated verification to ensure DB saving is functional."
    });
    
    if (testMsg) {
        console.log('✅ TEST PASSED: Message was saved to the database successfully.');
        console.log('Message ID:', testMsg._id);
        
        // Clean up the test message
        await Message.findByIdAndDelete(testMsg._id);
        console.log('🧹 Cleanup: Test message removed.');
    }
    
    const count = await Message.countDocuments();
    console.log('📊 Current total valid messages in DB:', count);
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ DB Verification Failed:', err);
    process.exit(1);
  });
