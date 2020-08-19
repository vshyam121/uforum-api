const mongoose = require('mongoose');
const slugify = require('slugify');
const uniqueValidator = require('mongoose-unique-validator');

const ForumSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Forum name is required'],
    unique: true,
  },
  slug: {
    type: String,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ForumSchema.plugin(uniqueValidator, {
  message: 'Error, expected {PATH} to be unique.',
});

module.exports = mongoose.model('Forum', ForumSchema);
