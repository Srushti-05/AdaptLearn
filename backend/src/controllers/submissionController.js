/**
 * submissionController.js
 * ────────────────────────
 * Fully Connected Pipeline:
 *  - Phase 1: Secure sandbox execution (Judge0 -> Piston -> Local)
 *  - Phase 2: Dynamic Elo rating + BKT Knowledge Tracing
 *  - Phase 3: Empirical Asymptotic Complexity Profiler & Static Code Quality
 *  - Phase 4: Automated Scaffolded Remediation Pathways
 */

const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const User = require('../models/User');

const { executeCode } = require('../services/sandboxService');
const { updateElo } = require('../services/eloService');
const { updateBKT } = require('../services/bktService');
const { profileComplexity } = require('../services/complexityProfiler');
const { analyzeQuality, fingerprintCode } = require('../services/codeQualityService');
const { checkRemediation } = require('../services/remediationService');

// @desc    Submit code for evaluation
// @route   POST /api/submissions
// @access  Private
exports.submitCode = async (req, res) => {
  try {
    const { problem_id, code, time_taken, language = 'python', hint_level_used = 0 } = req.body;

    const problem = await Problem.findById(problem_id);
    if (!problem) {
      return res.status(404).json({ success: false, error: 'Problem not found' });
    }

    // ── Phase 1: Sandbox Execution ──────────────────────────────
    const results = await executeCode(code, problem.test_cases, language);
    const allTestsPassed = results.every((r) => r.passed);

    let outputResult;
    if (allTestsPassed) {
      outputResult = 'All test cases passed!';
    } else {
      const failed = results.find((r) => !r.passed);
      if (failed?.stderr) {
        outputResult = failed.stderr;
      } else {
        outputResult = `Test Failed.\nExpected: ${failed?.expected}\nOutput:   ${failed?.stdout}`;
      }
    }

    const execution_time_ms = results.reduce((max, r) => Math.max(max, r.time_ms || 0), 0);
    const memory_used_kb = results.reduce((max, r) => Math.max(max, r.memory_kb || 0), 0);

    // ── Phase 3: Empirical Complexity & Static Quality ──────────
    let empirical_complexity = problem.complexity_expected || 'O(n)';
    let profile_data = [];
    if (allTestsPassed) {
      const profileResult = await profileComplexity(code, problem, language);
      empirical_complexity = profileResult.empirical_complexity;
      profile_data = profileResult.profile_data;
    }

    const quality = analyzeQuality(code, language);
    const code_fingerprint = fingerprintCode(code);

    // ── Phase 2: Elo & BKT Knowledge Tracing ────────────────────
    const user = await User.findById(req.user.id);
    let totalEloDelta = 0;

    for (const tag of problem.concept_tags) {
      const currentElo = user.skill_ratings.get(tag) || 1200;
      const attemptCount = user.attempt_counts.get(tag) || 0;

      const { newRating, delta } = updateElo(
        currentElo,
        problem.difficulty,
        allTestsPassed,
        attemptCount,
        hint_level_used
      );

      user.skill_ratings.set(tag, newRating);
      totalEloDelta += delta;

      // Update BKT
      const bktKey = `bkt_${tag}`;
      const priorBKT = user.skill_ratings.get(bktKey) || 0.30;
      const newBKT = updateBKT(priorBKT, allTestsPassed);
      user.skill_ratings.set(bktKey, newBKT);

      // Attempt counts
      if (allTestsPassed) {
        user.attempt_counts.set(tag, 0);
      } else {
        user.attempt_counts.set(tag, attemptCount + 1);
      }

      // Sync weak_topics
      const tagWeak = !allTestsPassed && newBKT < 0.65;
      if (tagWeak && !user.weak_topics.includes(tag)) {
        user.weak_topics.push(tag);
      } else if (!tagWeak && newBKT >= 0.65) {
        user.weak_topics = user.weak_topics.filter((t) => t !== tag);
      }
    }

    // Daily streak update
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const lastStreak = user.streak_dates.at(-1);
    const alreadyLoggedToday =
      lastStreak && new Date(lastStreak).setHours(0, 0, 0, 0) === todayStart.getTime();
    if (!alreadyLoggedToday) {
      user.streak_dates.push(todayStart);
    }

    // ── Phase 4: Scaffolded Remediation Check ───────────────────
    let remediation = { triggered: false };
    if (!allTestsPassed) {
      remediation = await checkRemediation(user, problem);
    }

    await user.save();

    // ── Persist Submission ──────────────────────────────────────
    const submission = await Submission.create({
      user_id: req.user.id,
      problem_id: problem._id,
      code,
      result: outputResult,
      success: allTestsPassed,
      time_taken: time_taken || 0,
      concept_tags: problem.concept_tags,
      language,
      execution_time_ms,
      memory_used_kb,
      empirical_complexity,
      hint_level_used,
      elo_delta: Math.round(totalEloDelta / (problem.concept_tags.length || 1))
    });

    res.status(201).json({
      success: true,
      data: {
        submission,
        remediation,
        empirical_complexity,
        profile_data,
        quality
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get current user's submissions
// @route   GET /api/submissions/me
// @access  Private
exports.getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ user_id: req.user.id })
      .populate('problem_id', 'title difficulty concept_tags')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
