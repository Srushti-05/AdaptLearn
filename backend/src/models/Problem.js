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
  // ── Phase 0: prerequisite DAG edges ──────────────────────────────────────
  // List of concept_tags that must be mastered before this problem is unlocked.
  // e.g. 'binary search' has prerequisite_tags: ['arrays']
  prerequisite_tags: {
    type: [String],
    default: []
  },
  // ── Phase 0: multi-language support ──────────────────────────────────────
  languages_supported: {
    type: [String],
    default: ['python']
  },
  // ── Phase 0: expected algorithmic complexity (for the profiler) ──────────
  // e.g. 'O(n)', 'O(n log n)', 'O(n²)'
  complexity_expected: {
    type: String,
    default: ''
  },
  // ── Phase 0: Python code that generates synthetic inputs of size n ────────
  // Used by the complexity profiler (Phase 3) to benchmark empirical scaling.
  // Must define a function print_input(n) that prints the generated input.
  input_generator: {
    type: String,
    default: ''
  },
  // ── Existing test_cases kept for backward compatibility ───────────────────
  // These are shown to the user in the workspace UI.
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
  // ── Phase 0: hidden test cases (never sent to frontend) ──────────────────
  // Evaluated server-side only during final grading (Phase 1 sandbox).
  hidden_test_cases: [
    {
      input: String,
      expected_output: String
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Problem', problemSchema);
