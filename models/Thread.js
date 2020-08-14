const mongoose = require('mongoose');

const ThreadSchema = new mongoose.Schema({
  forum: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Forum',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  slug: String,
  pinned: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  tags: [
    {
      type: String,
    },
  ],
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  replies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reply',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Thread', ThreadSchema);
