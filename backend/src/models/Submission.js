const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  problem_id: {
    type: mongoose.Schema.ObjectId,
    ref: 'Problem',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  result: {
    type: String // We will store 'Passed', 'Failed', or full error string
  },
  success: {
    type: Boolean,
    default: false
  },
  time_taken: {
    type: Number // in seconds or ms
  },
  concept_tags: {
    type: [String] // snapshot of problem's tags at submission time
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Submission', submissionSchema);
