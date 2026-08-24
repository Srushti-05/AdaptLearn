const express = require('express');
const { submitCode, getMySubmissions } = require('../controllers/submissionController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, submitCode);

router.route('/me')
  .get(protect, getMySubmissions);

module.exports = router;
