/**
 * submissionController.js
 * ────────────────────────
 * Phase 1 update: uses sandboxService (Judge0 → Piston → local fallback)
 * instead of the old pistonService.
 *
 * Also persists the Phase 0 fields added to Submission:
 *   language, execution_time_ms, memory_used_kb
 */

const Submission = require('../models/Submission');
const Problem    = require('../models/Problem');
const User       = require('../models/User');
const { executeCode } = require('../services/sandboxService');   // ← Phase 1

// @desc    Submit code for a problem
// @route   POST /api/submissions
// @access  Private
exports.submitCode = async (req, res) => {
  try {
    const { problem_id, code, time_taken, language = 'python' } = req.body;

    const problem = await Problem.findById(problem_id);
    if (!problem) {
      return res.status(404).json({ success: false, error: 'Problem not found' });
    }

    // ── Run code against all visible test cases ──────────────
    // sandboxService handles the loop internally and returns a results array.
    // It stops at the first failure (fail-fast) so the array may be shorter
    // than the full test_cases list.
    const results = await executeCode(code, problem.test_cases, language);

    // ── Determine overall pass/fail ──────────────────────────
    const allTestsPassed = results.every((r) => r.passed);

    // ── Build human-readable output for the terminal pane ────
    let outputResult;
    if (allTestsPassed) {
      outputResult = 'All test cases passed!';
    } else {
      const failed = results.find((r) => !r.passed);
      if (failed.stderr) {
        outputResult = failed.stderr;
      } else {
        outputResult =
          `Test Failed.\nExpected: ${failed.expected}\nOutput:   ${failed.stdout}`;
      }
    }

    // ── Collect sandbox metrics from results ─────────────────
    // Take the maximum time and memory across all executed test cases.
    const execution_time_ms = results.reduce((max, r) => Math.max(max, r.time_ms   || 0), 0);
    const memory_used_kb    = results.reduce((max, r) => Math.max(max, r.memory_kb || 0), 0);

    // ── Save submission (Phase 0 fields now populated) ────────
    const submission = await Submission.create({
      user_id:            req.user.id,
      problem_id:         problem._id,
      code,
      result:             outputResult,
      success:            allTestsPassed,
      time_taken:         time_taken || 0,
      concept_tags:       problem.concept_tags,
      language,                   // Phase 0
      execution_time_ms,          // Phase 0
      memory_used_kb,             // Phase 0
      // empirical_complexity, hint_level_used, elo_delta — filled by later phases
    });

    // ── Update user weak_topics if failed (existing logic) ───
    // Phase 2 will replace this with Elo/BKT; kept for now so the
    // existing dashboard still shows weak topics correctly.
    if (!allTestsPassed) {
      const user = await User.findById(req.user.id);
      problem.concept_tags.forEach((tag) => {
        if (!user.weak_topics.includes(tag)) {
          user.weak_topics.push(tag);
        }
      });
      await user.save();
    }

    res.status(201).json({ success: true, data: submission });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get current user's submissions
// @route   GET /api/submissions/me
// @access  Private
exports.getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission
      .find({ user_id: req.user.id })
      .populate('problem_id', 'title difficulty concept_tags');
    res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
