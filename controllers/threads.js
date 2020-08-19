const asyncHandler = require('../middleware/async');

const Thread = require('../models/Thread');
const Reply = require('../models/reply');

const { v4 } = require('uuid');
const ErrorResponse = require('../utils/ErrorResponse');

//@desc Create a new thread
//@route POST /api/threads
//@access Private
exports.createThread = asyncHandler(async (req, res, next) => {
  const { forum, user, pinned, title, content, tags } = req.body;

  let newThread = await Thread.create({
    forum,
    user,
    pinned,
    title,
    content,
    tags,
    slug: v4(),
  });

  newThread = await newThread.populate('user').execPopulate();

  res.status(201).send({ success: true, thread: newThread });
});

//@desc Patch a thread, i.e. toggle pinned
//@route PATCH /api/threads/:threadId
//@access Private
exports.patchThread = asyncHandler(async (req, res, next) => {
  //Only pinned field is patchable
  const { pinned } = req.body;

  let thread = await Thread.findByIdAndUpdate(
    { _id: req.params.threadId },
    {
      $set: {
        pinned,
      },
    },
    { new: true, runValidators: true }
  );

  thread = await thread.populate('user').execPopulate();

  res.status(200).send({ success: true, thread: thread });
});

//@desc Get threads
//@route GET /api/threads
//@access Private
exports.getThreads = asyncHandler(async (req, res, next) => {
  const threads = await Thread.find(req.query).populate('user');

  res.status(200).send({ success: true, threads: threads });
});

exports.deleteThread = asyncHandler(async (req, res, next) => {
  const thread = await Thread.findById({ _id: req.params.threadId });

  if (!thread) {
    return next(new ErrorResponse('Unable to find thread', 400));
  }

  await Reply.deleteMany({ _id: { $in: thread.replies } });

  await Thread.deleteOne({ _id: req.params.threadId });

  res.status(200).send({ success: true });
});

//@desc Create a new reply for a thread
//@route POST /api/threads/:threadId/replies
//@access Private
exports.createReplyForThread = asyncHandler(async (req, res, next) => {
  const { content, user, forum } = req.body;
  let newReply = await Reply.create({ content, user, forum });

  newReply = await newReply.populate('user').execPopulate();

  await Thread.findOneAndUpdate(
    { _id: req.params.threadId },
    {
      $push: {
        replies: { _id: newReply._id },
      },
    },
    { new: true, runValidators: true }
  );

  res.status(201).send({ success: true, reply: newReply });
});

//@desc Get all replies for a thread
//@route GET /api/threads/:threadId/replies
//@access Private
exports.getRepliesForThread = asyncHandler(async (req, res, next) => {
  const thread = await Thread.findById({ _id: req.params.threadId });

  const replies = await Reply.find({ _id: { $in: thread.replies } })
    .populate('user')
    .sort({ _id: -1 });

  res.status(200).send({ success: true, replies: replies });
});

//@desc Delete thread
//@route DELETE /api/threads/:threadId/replies/:replyId
//@access Private
exports.deleteReplyForThread = asyncHandler(async (req, res, next) => {
  const replyDeleted = await Reply.deleteOne({ _id: req.params.replyId });

  if (replyDeleted.deleteCount === 0) {
    return next(new ErrorResponse('Unable to delete thread', 400));
  }

  await Thread.findByIdAndUpdate(
    { _id: req.params.threadId },
    { $pull: { replies: req.params.replyId } },
    { new: true, runValidators: true }
  );

  res.status(200).send({ success: true });
});

//@desc Add user to favorites for a thread
//@route POST /api/threads/:threadId/favorites
//@access Private
exports.addToFavorites = asyncHandler(async (req, res, next) => {
  const thread = await Thread.findByIdAndUpdate(
    { _id: req.params.threadId },
    { $addToSet: { favorites: req.body } },
    { new: true, runValidators: true }
  );

  res.status(201).send({ success: true, favorites: thread.favorites });
});

//@desc Add user to favorites for a thread
//@route DELETE /api/threads/:threadId/favorites/:userId
//@access Private
exports.deleteFromFavorites = asyncHandler(async (req, res, next) => {
  const thread = await Thread.findByIdAndUpdate(
    { _id: req.params.threadId },
    { $pull: { favorites: req.params.userId } },
    { new: true, runValidators: true }
  );

  res.status(200).send({ success: true, favorites: thread.favorites });
});

//@desc Get a thread
//@route GET /api/threads
//@access Private
exports.getUserThreads = asyncHandler(async (req, res, next) => {
  const threads = await Thread.find({ user: req.params.userId })
    .populate('user')
    .populate('forum');

  res.status(200).send({ success: true, threads: threads });
});
