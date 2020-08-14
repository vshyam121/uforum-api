const express = require('express');
const router = express.Router();

const { protect, adminProtect } = require('../middleware/auth');
const {
  createThread,
  getThreads,
  getRepliesForThread,
  deleteFromFavorites,
  addToFavorites,
  deleteThread,
  deleteReplyForThread,
  createReplyForThread,
  patchThread,
} = require('../controllers/threads');

router.route('/').get(getThreads).post(protect, createThread);
router
  .route('/:threadId')
  .delete(protect, deleteThread)
  .patch(adminProtect, patchThread);
router
  .route('/:threadId/replies')
  .get(getRepliesForThread)
  .post(protect, createReplyForThread);
router
  .route('/:threadId/replies/:replyId')
  .delete(protect, deleteReplyForThread);
router.route('/:threadId/favorites').post(protect, addToFavorites);
router
  .route('/:threadId/favorites/:userId')
  .delete(protect, deleteFromFavorites);

module.exports = router;
