/**
 * remediationService.js  —  Phase 4: Scaffolded Remediation Pathways
 * ─────────────────────────────────────────────────────────────────
 * Detects persistent conceptual struggle:
 *   - 3 consecutive failures on a concept, OR
 *   - BKT mastery probability < 0.65
 * When triggered, dynamically selects an unlocked foundational/prerequisite
 * problem to scaffold the student's learning before returning to the challenge.
 */

const Problem = require('../models/Problem');
const Submission = require('../models/Submission');

const FAIL_COUNT_THRESHOLD = 3;
const REMEDIATION_BKT_THRESHOLD = 0.65;

/**
 * Check if the user needs a remediation intervention
 */
exports.checkRemediation = async (user, failedProblem) => {
  try {
    // Solved problems to exclude
    const solvedIds = await Submission.find({
      user_id: user._id,
      success: true
    }).distinct('problem_id');

    for (const tag of failedProblem.concept_tags) {
      const failCount = user.attempt_counts?.get(tag) || 0;
      const bktScore = user.skill_ratings?.get(`bkt_${tag}`) || 0.30;

      if (failCount >= FAIL_COUNT_THRESHOLD || bktScore < REMEDIATION_BKT_THRESHOLD) {
        // Look for prerequisite tags first
        const searchTags = (failedProblem.prerequisite_tags && failedProblem.prerequisite_tags.length > 0)
          ? failedProblem.prerequisite_tags
          : [tag];

        // Search for an easier unsolved problem matching the foundational tags
        let remediationProblem = await Problem.findOne({
          _id: { $nin: [...solvedIds, failedProblem._id] },
          concept_tags: { $in: searchTags },
          difficulty: 'easy'
        });

        // If no easy problem found, search for any easy problem not solved
        if (!remediationProblem) {
          remediationProblem = await Problem.findOne({
            _id: { $nin: [...solvedIds, failedProblem._id] },
            difficulty: 'easy'
          });
        }

        if (remediationProblem) {
          return {
            triggered: true,
            concept: tag,
            reason: `Identified struggle with "${tag}" (${failCount} attempts, ${(bktScore * 100).toFixed(0)}% mastery). Let's reinforce prerequisite foundations with an easier challenge first.`,
            remediation_problem: {
              _id: remediationProblem._id,
              title: remediationProblem.title,
              difficulty: remediationProblem.difficulty,
              concept_tags: remediationProblem.concept_tags
            },
            return_to_problem: {
              _id: failedProblem._id,
              title: failedProblem.title
            }
          };
        }
      }
    }
  } catch (error) {
    console.error('Error in checkRemediation:', error);
  }

  return { triggered: false };
};
