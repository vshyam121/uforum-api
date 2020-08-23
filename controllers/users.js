const asyncHandler = require('../middleware/async');

const User = require('../models/User');
const Thread = require('../models/Thread');

//@desc Get a thread
//@route GET /api/users/:username/threads
//@access Public
exports.getUserThreads = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ username: req.params.username });

  const threads = await Thread.find({ user: user._id })
    .populate('forum')
    .populate('user')
    .sort({ createdAt: -1 });

  res.status(200).send({ success: true, threads: threads });
});

//@desc Get a thread
//@route GET /api/users/:username
//@access Public
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ username: req.params.username });

  res.status(200).send({ success: true, user: user });
});
