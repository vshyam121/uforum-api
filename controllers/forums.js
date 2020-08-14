const asyncHandler = require('../middleware/async');
const Forum = require('../models/Forum');
const Thread = require('../models/Thread');
const mongoose = require('mongoose');

//@desc Create a new forum
//@route POST /api/forums
//@access Private
exports.createForum = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  //Create forum
  const newForum = await Forum.create({ name });

  //Send back new forum
  res.status(201).send({ success: true, forum: newForum });
});

//@desc Get all forums
//@route GET /api/forums
//@access Public
exports.getAllForums = asyncHandler(async (req, res, next) => {
  const allForums = await Forum.find();

  res.status(200).send({ success: true, forums: allForums });
});

//@desc Get all threads for a forum
//@route GET /api/forums/:forumId/threads
//@access Public
exports.getThreadsForForum = asyncHandler(async (req, res, next) => {
  const reqQuery = { ...req.query };
  delete reqQuery['sorting_method'];

  let query;

  if (req.query.sorting_method === 'popularity') {
    query = Thread.aggregate([
      {
        $match: {
          forum: mongoose.Types.ObjectId(req.params.forumId),
          ...reqQuery,
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
          forum: { $arrayElemAt: ['$forum', 0] },
          user: { $arrayElemAt: ['$user', 0] },
        },
      },
    ]);
  } else {
    query = Thread.find({
      forum: req.params.forumId,
      ...reqQuery,
    })
      .populate('user')
      .populate('forum')
      .sort({ createdAt: -1 });
  }

  const threads = await query;

  console.log(threads);

  res.status(200).send({ success: true, threads: threads });
});
