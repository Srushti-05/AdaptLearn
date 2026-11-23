/**
 * hintRoutes.js  —  Phase 5: Socratic AI Hint API
 * ───────────────────────────────────────────────
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const Problem = require('../models/Problem');
const User = require('../models/User');
const { getSocraticHint } = require('../services/socraticHintService');
const { extractAST } = require('../services/astService');

// @route   POST /api/hints
// @desc    Request Socratic scaffolding hint (Tier 1: Concept, Tier 2: Edge Case, Tier 3: Pseudocode)
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { problem_id, code, execution_error, hint_level = 1 } = req.body;

    const problem = await Problem.findById(problem_id);
    if (!problem) {
      return res.status(404).json({ success: false, error: 'Problem not found' });
    }

    const user = await User.findById(req.user.id);

    // Build skill state for problem tags
    const skillState = {};
    for (const tag of problem.concept_tags) {
      const elo = user.skill_ratings?.get(tag) || 1200;
      const bkt = user.skill_ratings?.get(`bkt_${tag}`) || 0.30;
      skillState[tag] = {
        elo,
        mastery_percent: Math.round(bkt * 100)
      };
    }

    const astSummary = await extractAST(code || '');

    const hint = await getSocraticHint({
      problem,
      code,
      executionError: execution_error,
      astSummary,
      skillState,
      hintLevel: parseInt(hint_level, 10) || 1,
      studentName: user.name || 'Learner'
    });

    res.status(200).json({
      success: true,
      data: {
        hint,
        hint_level: parseInt(hint_level, 10) || 1,
        ast_summary: astSummary
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /api/hints/chat
// @desc    Freeform Socratic dialogue with the AI Tutor
// @access  Private
router.post('/chat', protect, async (req, res) => {
  try {
    const { message } = req.body;
    const user = await User.findById(req.user.id);
    const axios = require('axios');

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      try {
        const prompt = `You are the AdaptLearn Socratic AI Tutor assisting student ${user.name || 'Learner'}.
The student asks: "${message}".
Give a supportive, concise (under 120 words), pedagogical explanation of the algorithm or concept without writing complete problem answers. Encourage them toward mastery.`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const geminiRes = await axios.post(url, {
          contents: [{ parts: [{ text: prompt }] }]
        }, { timeout: 8000 });

        const reply = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          return res.status(200).json({ success: true, data: { reply: reply.trim() } });
        }
      } catch (err) {
        console.warn('Chat Gemini API call failed, falling back:', err.message);
      }
    }

    // Heuristic Socratic fallback
    let reply = `That is a great conceptual question! In algorithmic problem solving, always start by identifying the bottleneck (e.g. searching time in O(n) vs O(1)). What invariants does your problem maintain?`;
    const q = (message || '').toLowerCase();
    if (q.includes('two sum')) {
      reply = `For Two Sum: Instead of comparing every pair in O(n²), consider storing each number's complement (target - num) in a hash map as you iterate. That yields O(1) lookup and O(n) time!`;
    } else if (q.includes('binary search')) {
      reply = `In Binary Search: The list must be sorted. You test the middle element; if it's smaller than the target, you discard the entire left half. That logarithmic pruning is why it runs in O(log n).`;
    } else if (q.includes('streak') || q.includes('progress')) {
      reply = `Consistent daily practice reinforces memory patterns and builds intuition for common data structures far more effectively than cramming. Keep up your active streak!`;
    } else if (q.includes('dynamic programming') || q.includes('dp')) {
      reply = `Dynamic Programming is essentially recursion without repetition. Check if subproblems overlap and have optimal substructure. What base cases can you identify first?`;
    }

    res.status(200).json({ success: true, data: { reply } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
