const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
  forum: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Forum',
  },
  content: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Reply', ReplySchema);
