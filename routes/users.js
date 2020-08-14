const express = require('express');
const router = express.Router();

const { getUserThreads, getUser } = require('../controllers/users');

router.route('/:username').get(getUser);
router.route('/:username/threads').get(getUserThreads);

module.exports = router;
