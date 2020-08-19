const asyncHandler = require('../middleware/async');
const Forum = require('../models/Forum');
const Thread = require('../models/Thread');
const Reply = require('../models/reply');
const mongoose = require('mongoose');
const ErrorResponse = require('../utils/ErrorResponse');
const slugify = require('slugify');

//@desc Create a new forum
//@route POST /api/forums
//@access Private
exports.createForum = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  const slug = slugify(name, { lower: true });

  //Create forum
  await Forum.create({ name, slug });

  const allForums = await Forum.find();

  //Send back all forums including new one
  res.status(201).send({ success: true, forums: allForums });
});

//@desc Get all forums
//@route GET /api/forums
//@access Public
exports.getAllForums = asyncHandler(async (req, res, next) => {
  const allForums = await Forum.find();

  res.status(200).send({ success: true, forums: allForums });
});

//@desc Delete a forum and related resources
//@route DELETE /api/forums/:forumId
//@access Private
exports.deleteForum = asyncHandler(async (req, res, next) => {
  const forum = await Forum.deleteOne({ _id: req.params.forumId });

  if (forum.deletedCount === 0) {
    return next(new ErrorResponse('Unable to delete forum', 400));
  }

  await Thread.deleteMany({ forum: req.params.forumId });

  await Reply.deleteMany({ forum: req.params.forumId });

  res.status(200).send({ success: true });
});

//@desc Get all threads for a forum
//@route GET /api/forums/:forumId/threads
//@access Public
exports.getThreadsForForum = asyncHandler(async (req, res, next) => {
  delete req.query['sorting_method'];

  let query;

  if (req.query.sorting_method === 'popularity') {
    query = Thread.aggregate([
      {
        $match: {
          forum: mongoose.Types.ObjectId(req.params.forumId),
          ...req.query,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $lookup: {
          from: 'forums',
          localField: 'forum',
          foreignField: '_id',
          as: 'forum',
        },
      },
      {
        $addFields: {
          sortOrder: {
            $add: [{ $size: '$favorites' }, { $size: '$replies' }],
          },
        },
      },
      { $sort: { sortOrder: -1 } },
      {
        $project: {
          slug: 1,
          title: 1,
          tags: 1,
          favorites: 1,
          replies: 1,
          createdAt: 1,
          pinned: 1,
          forum: { $arrayElemAt: ['$forum', 0] },
          user: { $arrayElemAt: ['$user', 0] },
        },
      },
    ]);
  } else {
    query = Thread.find({
      forum: req.params.forumId,
      ...req.query,
    })
      .populate('user')
      .populate('forum')
      .sort({ createdAt: -1 });
  }

  const threads = await query;

  res.status(200).send({ success: true, threads: threads });
});
