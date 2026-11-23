const express = require('express');
const {
  getDashboardStats,
  getRecommendation,
  getSkillState,
  getLearningPath
} = require('../controllers/adaptiveController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/dashboard', protect, getDashboardStats);
router.get('/recommendation', protect, getRecommendation);
router.get('/skill-state', protect, getSkillState);
router.get('/learning-path', protect, getLearningPath);

module.exports = router;
