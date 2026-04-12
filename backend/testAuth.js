require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to DB');
    const email = 'admin@gmail.com';
    const rawPassword = 'admin123';
    
    const user = await User.findOne({ email });
    if (!user) {
        console.log('User not found!');
    } else {
        const isMatch = await bcrypt.compare(rawPassword, user.password);
        console.log('Match result:', isMatch);
        console.log('User role:', user.role);
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
