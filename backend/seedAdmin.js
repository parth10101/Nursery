require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to DB');
    const email = 'admin@gmail.com'.toLowerCase().trim();
    const password = await bcrypt.hash('admin123', 10);
    
    let adminUser = await User.findOne({ email });
    if (adminUser) {
        adminUser.password = password;
        adminUser.role = 'admin';
        await adminUser.save();
        console.log('Admin user updated successfully');
    } else {
        await User.create({ email, password, role: 'admin' });
        console.log('Admin user created successfully');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
