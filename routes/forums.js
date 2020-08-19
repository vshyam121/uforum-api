const express = require('express');
const router = express.Router();

const { adminProtect } = require('../middleware/auth');
const {
  createForum,
  deleteForum,
  getAllForums,
  getThreadsForForum,
} = require('../controllers/forums');

router.route('/').get(getAllForums).post(adminProtect, createForum);
router.route('/:forumId').delete(adminProtect, deleteForum);
router.route('/:forumId/threads').get(getThreadsForForum);

module.exports = router;
