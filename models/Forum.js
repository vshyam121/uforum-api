const mongoose = require('mongoose');
const slugify = require('slugify');

const ForumSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  slug: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ForumSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

module.exports = mongoose.model('Forum', ForumSchema);
