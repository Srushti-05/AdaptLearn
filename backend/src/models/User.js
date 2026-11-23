const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  skill_level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  // ── Kept for backward compatibility (adaptiveController still reads this) ─
  weak_topics: {
    type: [String],
    default: []
  },
  // ── Phase 0: per-topic Elo ratings + BKT knowledge probabilities ──────────
  // Key format for Elo  : tag name         e.g. { 'arrays': 1250 }
  // Key format for BKT  : 'bkt_' + tag     e.g. { 'bkt_arrays': 0.72 }
  // Both are stored in a single Map to keep the schema simple.
  skill_ratings: {
    type: Map,
    of: Number,
    default: {}
  },
  // ── Phase 0: consecutive fail counter per concept tag ─────────────────────
  // Incremented each time a problem with that tag is failed.
  // Reset to 0 when a problem with that tag is passed.
  // Phase 4 (Remediation) uses this to trigger intervention after 3 fails.
  attempt_counts: {
    type: Map,
    of: Number,
    default: {}
  },
  // ── Phase 0: daily activity log for real streak calculation ───────────────
  // Each entry is the start-of-day Date when the user submitted at least once.
  // Phase 6 (Analytics) replaces the hardcoded "7 Day Streak" with this.
  streak_dates: {
    type: [Date],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
