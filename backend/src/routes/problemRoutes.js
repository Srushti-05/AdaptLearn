const express = require('express');
const { getProblems, getProblem, createProblem } = require('../controllers/problemController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getProblems)
  .post(protect, createProblem);

router.route('/:id')
  .get(getProblem);

module.exports = router;
