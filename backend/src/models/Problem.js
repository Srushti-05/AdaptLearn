const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  concept_tags: {
    type: [String],
    required: true
  },
  test_cases: [
    {
      input: String,
      expected_output: String,
      is_hidden: {
        type: Boolean,
        default: false
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Problem', problemSchema);
