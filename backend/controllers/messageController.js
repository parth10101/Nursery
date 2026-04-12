const Message = require('../models/Message');

// @desc    Create a new message
// @route   POST /api/messages
// @access  Public
const createMessage = async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !phone || !message) {
    console.log('⚠️ Message creation failed: Missing required fields');
    return res.status(400).json({ message: 'Please provide all details' });
  }

  try {
    const newMessage = await Message.create({
      name,
      email,
      phone,
      message
    });

    if (newMessage) {
      console.log(`✅ Message FROM ${name} SAVED to Database successfully.`);
      res.status(201).json({ success: true, data: newMessage });
    } else {
      throw new Error("Failed to save message to database");
    }
  } catch (error) {
    console.error(`❌ Message Save Error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all messages
// @route   GET /api/messages
// @access  Private/Admin
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({}).sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update message status
// @route   PUT /api/messages/:id/status
// @access  Private/Admin
const updateMessageStatus = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (message) {
      message.status = req.body.status || 'read';
      const updatedMessage = await message.save();
      res.json(updatedMessage);
    } else {
      res.status(404).json({ message: 'Message not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete message
// @route   DELETE /api/messages/:id
// @access  Private/Admin
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (message) {
      await message.deleteOne();
      res.json({ message: 'Message removed' });
    } else {
      res.status(404).json({ message: 'Message not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createMessage,
  getMessages,
  updateMessageStatus,
  deleteMessage
};
