const Submission = require('../models/Submission');
const Problem = require('../models/Problem');

exports.getDashboardStats = async (req, res) => {
  try {
    const submissions = await Submission.find({ user_id: req.user.id });
    
    const totalSubmissions = submissions.length;
    const successfulSubmissions = submissions.filter(s => s.success).length;
    
    // Group unique problems solved
    const solvedProblemIds = new Set(submissions.filter(s => s.success).map(s => s.problem_id.toString()));
    const problemsSolvedCount = solvedProblemIds.size;

    const accuracy = totalSubmissions === 0 ? 0 : Math.round((successfulSubmissions / totalSubmissions) * 100);

    res.status(200).json({
      success: true,
      data: {
        totalSubmissions,
        problemsSolvedCount,
        accuracy,
        weak_topics: req.user.weak_topics
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getRecommendation = async (req, res) => {
  try {
    const weakTopics = req.user.weak_topics || [];
    const skillLevel = req.user.skill_level || 'beginner';
    
    // Map skill level to difficulty
    let difficulty = 'easy';
    if (skillLevel === 'intermediate') difficulty = 'medium';
    if (skillLevel === 'advanced') difficulty = 'hard';

    let recommendedProblem = null;

    // Try finding a problem matching weak topics and appropriate difficulty
    if (weakTopics.length > 0) {
      recommendedProblem = await Problem.findOne({
        concept_tags: { $in: weakTopics },
        difficulty: difficulty
      });
    }

    // Fallback if no matching weak topic problem
    if (!recommendedProblem) {
      recommendedProblem = await Problem.findOne({ difficulty: difficulty });
    }

    // Super fallback
    if (!recommendedProblem) {
      recommendedProblem = await Problem.findOne();
    }

    res.status(200).json({ success: true, data: recommendedProblem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
