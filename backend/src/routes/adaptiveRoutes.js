const express = require('express');
const { getDashboardStats, getRecommendation } = require('../controllers/adaptiveController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/dashboard', protect, getDashboardStats);
router.get('/recommendation', protect, getRecommendation);

module.exports = router;
