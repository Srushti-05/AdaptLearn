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
    type: String // 'Passed', 'Failed', or full error string
  },
  success: {
    type: Boolean,
    default: false
  },
  time_taken: {
    type: Number // seconds elapsed since problem was opened (from frontend timer)
  },
  concept_tags: {
    type: [String] // snapshot of problem's tags at submission time
  },
  // ── Phase 0: language of the submitted code ───────────────────────────────
  // Will be 'python' for all existing problems; expanded in Phase 1 (sandbox).
  language: {
    type: String,
    default: 'python'
  },
  // ── Phase 0: sandbox execution metrics ───────────────────────────────────
  // Populated by Phase 1 (Judge0 sandbox). Zero until Phase 1 is live.
  execution_time_ms: {
    type: Number,
    default: 0
  },
  memory_used_kb: {
    type: Number,
    default: 0
  },
  // ── Phase 0: empirical complexity label ───────────────────────────────────
  // Set by Phase 3 (Complexity Profiler). 'N/A' until Phase 3 is live.
  empirical_complexity: {
    type: String,
    default: 'N/A'
  },
  // ── Phase 0: AI hint tracking ─────────────────────────────────────────────
  // 0 = no hint used, 1 = concept hint, 2 = edge-case hint, 3 = pseudocode hint
  // Used by Phase 2 (Elo) to apply a smaller rating gain when hints were used.
  hint_level_used: {
    type: Number,
    default: 0
  },
  // ── Phase 0: code structure snapshot for AI tutor ─────────────────────────
  // Stringified JSON of the AST summary (functions, loops, recursion, etc.)
  // Populated by Phase 5 (Socratic AI) when a hint is requested.
  ast_snapshot: {
    type: String,
    default: ''
  },
  // ── Phase 0: Elo rating change from this submission ───────────────────────
  // Positive = rating went up (solved), Negative = rating went down (failed).
  // Populated by Phase 2 (Elo engine).
  elo_delta: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Submission', submissionSchema);
