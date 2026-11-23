/**
 * adaptiveController.js
 * ──────────────────────
 * Phase 6: Real MongoDB Aggregation & Dynamic Prerequisite Learning Path
 *
 * All dashboard metrics, radar charts, weekly frequency, streaks, and
 * learning path milestones are computed live from database records.
 */

const mongoose = require('mongoose');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const User = require('../models/User');
const { getZPDDifficulty } = require('../services/eloService');
const { masteryScore, isMastered } = require('../services/bktService');

// @desc    Get aggregated dashboard stats & analytics
// @route   GET /api/adaptive/dashboard
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const user = await User.findById(req.user.id);

    // 1. All user submissions
    const submissions = await Submission.find({ user_id: req.user.id });
    const totalSubmissions = submissions.length;
    const successfulSubmissions = submissions.filter((s) => s.success).length;

    // Solved distinct problems
    const solvedProblemIds = [
      ...new Set(submissions.filter((s) => s.success).map((s) => s.problem_id.toString()))
    ];
    const problemsSolvedCount = solvedProblemIds.length;

    const accuracy = totalSubmissions === 0
      ? 0
      : Math.round((successfulSubmissions / totalSubmissions) * 100);

    // Total problems available
    const totalProblemsInPlatform = await Problem.countDocuments();

    // 2. Real Daily Streak Calculation
    const sortedDates = [...(user.streak_dates || [])].sort((a, b) => new Date(b) - new Date(a));
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    let streak = 0;
    for (let i = 0; i < sortedDates.length; i++) {
      const d = new Date(sortedDates[i]);
      d.setHours(0, 0, 0, 0);
      const diffDays = Math.round((todayStart - d) / (1000 * 60 * 60 * 24));
      if (diffDays === i) {
        streak++;
      } else {
        break;
      }
    }

    // 3. Weekly activity (last 7 days grouped by day name)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const past7Days = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);
      past7Days.push(day);
    }

    const weeklyActivity = past7Days.map((dateObj) => {
      const nextDate = new Date(dateObj);
      nextDate.setDate(nextDate.getDate() + 1);

      const daySubs = submissions.filter((s) => {
        const subDate = new Date(s.createdAt);
        return subDate >= dateObj && subDate < nextDate;
      });

      return {
        name: dayNames[dateObj.getDay()],
        attempted: daySubs.length,
        solved: daySubs.filter((s) => s.success).length
      };
    });

    // 4. Topic Mastery Radar Data (Derived from user.skill_ratings BKT and Elo)
    const defaultTopics = ['arrays', 'strings', 'two pointers', 'hash map', 'dynamic programming', 'binary search'];
    const radarData = defaultTopics.map((topic) => {
      const bkt = user.skill_ratings?.get(`bkt_${topic}`) || 0.30;
      const elo = user.skill_ratings?.get(topic) || 1200;
      return {
        subject: topic.charAt(0).toUpperCase() + topic.slice(1),
        A: Math.round(bkt * 100),
        elo
      };
    });

    // 5. Difficulty distribution of solved problems
    const solvedProblems = await Problem.find({ _id: { $in: solvedProblemIds } });
    const diffBreakdown = [
      { name: 'Easy', value: solvedProblems.filter((p) => p.difficulty === 'easy').length, color: '#178C8E' },
      { name: 'Medium', value: solvedProblems.filter((p) => p.difficulty === 'medium').length, color: '#D97706' },
      { name: 'Hard', value: solvedProblems.filter((p) => p.difficulty === 'hard').length, color: '#DC2626' }
    ];

    // 6. Weak topics (BKT < 0.65)
    const weakTopics = [];
    if (user.skill_ratings) {
      for (const [key, val] of user.skill_ratings) {
        if (key.startsWith('bkt_') && val < 0.65) {
          weakTopics.push(key.replace('bkt_', ''));
        }
      }
    }
    const finalWeakTopics = weakTopics.length > 0 ? weakTopics : (user.weak_topics || []);

    res.status(200).json({
      success: true,
      data: {
        totalSubmissions,
        problemsSolvedCount,
        totalProblemsInPlatform,
        accuracy,
        streak,
        weeklyActivity,
        radarData,
        diffBreakdown,
        weak_topics: finalWeakTopics
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get next recommended challenge within Zone of Proximal Development (ZPD)
// @route   GET /api/adaptive/recommendation
// @access  Private
exports.getRecommendation = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const solvedIds = await Submission.find({
      user_id: req.user.id,
      success: true
    }).distinct('problem_id');

    const targetDifficulty = getZPDDifficulty(user.skill_ratings || new Map());

    const weakTags = [];
    if (user.skill_ratings) {
      for (const [key, val] of user.skill_ratings) {
        if (key.startsWith('bkt_') && val < 0.65) {
          weakTags.push(key.replace('bkt_', ''));
        }
      }
    }

    let recommended = null;

    if (weakTags.length > 0) {
      recommended = await Problem.findOne({
        _id: { $nin: solvedIds },
        concept_tags: { $in: weakTags },
        difficulty: targetDifficulty
      });
    }

    if (!recommended) {
      recommended = await Problem.findOne({
        _id: { $nin: solvedIds },
        difficulty: targetDifficulty
      });
    }

    if (!recommended) {
      recommended = await Problem.findOne({ _id: { $nin: solvedIds } });
    }

    if (!recommended) {
      recommended = await Problem.findOne();
    }

    res.status(200).json({ success: true, data: recommended });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get granular per-topic Elo and BKT mastery state
// @route   GET /api/adaptive/skill-state
// @access  Private
exports.getSkillState = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const skillState = {};

    if (user.skill_ratings) {
      for (const [key, elo] of user.skill_ratings) {
        if (key.startsWith('bkt_')) continue;
        const tag = key;
        const bktProb = user.skill_ratings.get(`bkt_${tag}`) || 0.30;
        skillState[tag] = {
          elo,
          mastery: masteryScore(bktProb),
          mastered: isMastered(bktProb),
          attempts: user.attempt_counts?.get(tag) || 0
        };
      }
    }

    res.status(200).json({ success: true, data: skillState });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get dynamic DAG learning curriculum with prerequisites & unlock states
// @route   GET /api/adaptive/learning-path
// @access  Private
exports.getLearningPath = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const solvedIds = await Submission.find({
      user_id: req.user.id,
      success: true
    }).distinct('problem_id');

    // Define Curriculum Modules & Prerequisite Graph
    const modulesDefinition = [
      {
        id: 'mod-1',
        title: 'Programming Foundations & Logic',
        description: 'Variables, loops, and conditional reasoning.',
        tags: ['math'],
        prerequisites: [],
        icon: 'check'
      },
      {
        id: 'mod-2',
        title: 'Arrays & Hash Maps',
        description: 'Linear data structures and key-value O(1) lookups.',
        tags: ['arrays', 'hash map'],
        prerequisites: [],
        icon: 'book'
      },
      {
        id: 'mod-3',
        title: 'Two Pointers & String Manipulation',
        description: 'Two-pointer convergence and string processing patterns.',
        tags: ['strings', 'two pointers'],
        prerequisites: ['arrays'],
        icon: 'code'
      },
      {
        id: 'mod-4',
        title: 'Binary Search & Divide and Conquer',
        description: 'Logarithmic search space pruning.',
        tags: ['binary search'],
        prerequisites: ['arrays'],
        icon: 'chart'
      },
      {
        id: 'mod-5',
        title: 'Dynamic Programming & Recursion',
        description: 'Optimal substructure and state memoization.',
        tags: ['dynamic programming', 'recursion'],
        prerequisites: ['arrays', 'math'],
        icon: 'trophy'
      }
    ];

    const modules = await Promise.all(
      modulesDefinition.map(async (mod) => {
        // Find problems belonging to this module's tags
        const problems = await Problem.find({ concept_tags: { $in: mod.tags } });
        const totalInModule = problems.length;
        const solvedInModule = problems.filter((p) =>
          solvedIds.some((sId) => sId.toString() === p._id.toString())
        ).length;

        const progressPercent = totalInModule === 0
          ? 0
          : Math.round((solvedInModule / totalInModule) * 100);

        // Check if all prerequisites meet the mastery threshold (BKT >= 0.50)
        let isLocked = false;
        for (const prereq of mod.prerequisites) {
          const prereqBKT = user.skill_ratings?.get(`bkt_${prereq}`) || 0.30;
          if (prereqBKT < 0.50) {
            isLocked = true;
            break;
          }
        }

        return {
          id: mod.id,
          title: mod.title,
          description: mod.description,
          tags: mod.tags,
          prerequisites: mod.prerequisites,
          totalChallenges: totalInModule,
          solvedChallenges: solvedInModule,
          progressPercent,
          status: progressPercent === 100 ? 'completed' : isLocked ? 'locked' : 'in_progress',
          icon: mod.icon
        };
      })
    );

    const totalProblems = await Problem.countDocuments();
    const overallProgress = totalProblems === 0 ? 0 : Math.round((solvedIds.length / totalProblems) * 100);

    res.status(200).json({
      success: true,
      data: {
        overallProgress,
        totalSolved: solvedIds.length,
        totalAvailable: totalProblems,
        modules
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
