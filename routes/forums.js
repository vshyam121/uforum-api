const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const {
  createForum,
  getAllForums,
  getThreadsForForum,
} = require('../controllers/forums');

router.route('/').get(getAllForums).post(protect, createForum);
router.route('/:forumId/threads').get(getThreadsForForum);

module.exports = router;
