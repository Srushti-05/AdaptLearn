const Problem = require('../models/Problem');

// @desc    Get all problems
// @route   GET /api/problems
// @access  Public
exports.getProblems = async (req, res) => {
  try {
    const problems = await Problem.find().select('-test_cases'); // Don't send test cases in list
    res.status(200).json({ success: true, count: problems.length, data: problems });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single problem
// @route   GET /api/problems/:id
// @access  Public
exports.getProblem = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ success: false, error: 'Problem not found' });
    }
    // We send test cases here because frontend needs to show them or at least know how many
    // Hide 'expected_output' for hidden cases if we wanted strict security, but for now we'll send it
    res.status(200).json({ success: true, data: problem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create new problem
// @route   POST /api/problems
// @access  Private (should be admin, but omitting role check for simplicity)
exports.createProblem = async (req, res) => {
  try {
    const problem = await Problem.create(req.body);
    res.status(201).json({ success: true, data: problem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
