const express = require('express');
const router = express.Router();
const { 
  createMessage, 
  getMessages, 
  updateMessageStatus, 
  deleteMessage 
} = require('../controllers/messageController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public route for customers to send messages
router.post('/', createMessage);

// Protected routes for admins to manage messages
router.get('/', protect, admin, getMessages);
router.put('/:id/status', protect, admin, updateMessageStatus);
router.delete('/:id', protect, admin, deleteMessage);

module.exports = router;
