const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const User = require('../models/User');
const { executeCode } = require('../services/pistonService');

// @desc    Submit code for a problem
// @route   POST /api/submissions
// @access  Private
exports.submitCode = async (req, res) => {
  try {
    const { problem_id, code, time_taken } = req.body;

    const problem = await Problem.findById(problem_id);
    if (!problem) {
      return res.status(404).json({ success: false, error: 'Problem not found' });
    }

    let allTestsPassed = true;
    let outputResult = '';

    // Run code against each test case
    for (const testCase of problem.test_cases) {
      let codeToExecute = code;
      let stdinInput = '';
      if (testCase.input) {
        if (testCase.input.includes('(') || testCase.input.includes('print')) {
          codeToExecute = `${code}\n\n${testCase.input}`;
        } else {
          stdinInput = testCase.input;
        }
      }

      const result = await executeCode(codeToExecute, stdinInput);
      
      // If code crashed or syntax error
      if (result.code !== 0) {
        allTestsPassed = false;
        outputResult = result.stderr || result.stdout || 'Runtime Error';
        break; 
      }

      const stdout = (result.stdout || '').trim();
      const expected = (testCase.expected_output || '').trim();

      if (stdout !== expected) {
        allTestsPassed = false;
        outputResult = `Test Failed.\nInput: ${testCase.input}\nExpected: ${expected}\nOutput: ${stdout}`;
        break;
      }
    }

    if (allTestsPassed) {
      outputResult = 'All test cases passed!';
    }

    // Save submission
    const submission = await Submission.create({
      user_id: req.user.id,
      problem_id: problem._id,
      code,
      result: outputResult,
      success: allTestsPassed,
      time_taken: time_taken || 0,
      concept_tags: problem.concept_tags
    });

    // Update user weak topics if failed
    if (!allTestsPassed) {
      const user = await User.findById(req.user.id);
      // Add problem's topics to weak topics (simplistic approach: just keep adding, might want a set)
      problem.concept_tags.forEach(tag => {
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
    const submissions = await Submission.find({ user_id: req.user.id }).populate('problem_id', 'title difficulty concept_tags');
    res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
