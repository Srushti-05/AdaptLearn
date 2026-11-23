/**
 * bktService.js  —  Phase 2: Bayesian Knowledge Tracing
 * ───────────────────────────────────────────────────────
 * BKT models the PROBABILITY that a student truly knows a concept,
 * as opposed to Elo which models RELATIVE SKILL RATING.
 *
 * Both are stored in User.skill_ratings:
 *   'arrays'      → Elo rating (number, e.g. 1250)
 *   'bkt_arrays'  → BKT knowledge probability (float 0.0 – 1.0)
 *
 * BKT Parameters (standard values from educational data mining literature):
 *   P_INIT  : Prior probability of knowing before any attempt
 *   P_LEARN : Probability of learning the concept on each attempt
 *   P_GUESS : Probability of correct answer despite NOT knowing
 *   P_SLIP  : Probability of wrong answer despite knowing
 *
 * Mastery threshold: BKT >= 0.80 → concept is "mastered"
 * This threshold is used by Phase 4 (Remediation) and Phase 6 (DAG unlock).
 */

const P_INIT  = 0.30;  // 30% prior knowledge before first attempt
const P_LEARN = 0.20;  // 20% chance of learning per attempt
const P_GUESS = 0.25;  // 25% chance of lucky correct answer
const P_SLIP  = 0.10;  // 10% chance of careless wrong answer

/** BKT probability at or above which a topic is considered mastered */
exports.MASTERY_THRESHOLD = 0.80;

/**
 * Update the BKT knowledge probability after one observation.
 *
 * Uses the standard BKT update equations:
 *   P(know | correct) = P(know) * (1 - P_SLIP)  /  P(correct)
 *   P(know | wrong)   = P(know) * P_SLIP          /  P(wrong)
 *   Then apply learning: P(know) = posterior + (1 - posterior) * P_LEARN
 *
 * @param {number}  priorKnow  - Current P(know) for this concept (0.0 – 1.0)
 * @param {boolean} correct    - Whether the student solved the problem
 * @returns {number} Updated P(know), clamped to [0.01, 0.99]
 */
exports.updateBKT = (priorKnow, correct) => {
  // Probability of observing this outcome given prior
  const pCorrect = priorKnow * (1 - P_SLIP) + (1 - priorKnow) * P_GUESS;
  const pWrong   = 1 - pCorrect;

  // Bayes update: posterior probability of knowing
  let posteriorKnow;
  if (correct) {
    posteriorKnow = (priorKnow * (1 - P_SLIP)) / pCorrect;
  } else {
    posteriorKnow = (priorKnow * P_SLIP) / pWrong;
  }

  // Apply learning: even after a failure, there's a chance the student learned
  const updatedKnow = posteriorKnow + (1 - posteriorKnow) * P_LEARN;

  // Clamp to avoid 0 or 1 (would make future updates degenerate)
  return Math.min(0.99, Math.max(0.01, updatedKnow));
};

/**
 * Convert a BKT probability to a 0–100 mastery score for display.
 * @param {number} pKnow - BKT probability
 * @returns {number} integer 0–100
 */
exports.masteryScore = (pKnow) => Math.round((pKnow || P_INIT) * 100);

/**
 * Check if a concept is mastered.
 * @param {number} pKnow - BKT probability
 * @returns {boolean}
 */
exports.isMastered = (pKnow) => (pKnow || 0) >= exports.MASTERY_THRESHOLD;
