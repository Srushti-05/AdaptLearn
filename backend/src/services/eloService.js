/**
 * eloService.js  —  Phase 2: Elo Rating Engine
 * ──────────────────────────────────────────────
 * Treats each concept tag (e.g. 'arrays', 'dynamic programming') as an
 * independent skill with its own Elo rating.
 *
 * User rating  : starts at 1200, rises on solve, drops on fail
 * Problem rating: fixed by difficulty (easy=1000, medium=1300, hard=1600)
 *
 * K-factor is dynamic:
 *   - Higher K early on (< 10 attempts) so the rating moves fast and settles
 *   - Lower K once established (>= 10 attempts) for stability
 *
 * Hint penalty: if the student used pseudocode hints (level 3), the
 * rating gain is reduced by 50% because the solution was partially given.
 */

const K_HIGH = 40;   // K-factor for new / uncertain ratings
const K_LOW  = 20;   // K-factor for established ratings
const K_THRESHOLD = 10; // attempts before switching to K_LOW

// Map problem difficulty to a fixed Elo problem rating
const DIFFICULTY_RATING = {
  easy:   1000,
  medium: 1300,
  hard:   1600,
};

/**
 * Expected win probability for a user against a problem.
 * Standard Elo formula.
 *
 * @param {number} userRating    - User's current Elo for this topic
 * @param {number} problemRating - Problem's fixed Elo
 * @returns {number} probability between 0 and 1
 */
const expectedScore = (userRating, problemRating) =>
  1 / (1 + Math.pow(10, (problemRating - userRating) / 400));

/**
 * Calculate the new Elo rating after a submission.
 *
 * @param {number}  currentRating  - User's rating before this attempt
 * @param {string}  difficulty     - 'easy' | 'medium' | 'hard'
 * @param {boolean} solved         - true = passed all tests, false = failed
 * @param {number}  attemptCount   - total attempts on this topic so far
 * @param {number}  hintLevel      - 0-3; 3 = pseudocode hint used
 * @returns {{ newRating: number, delta: number }}
 */
exports.updateElo = (currentRating, difficulty, solved, attemptCount = 0, hintLevel = 0) => {
  const problemRating = DIFFICULTY_RATING[difficulty] || 1300;
  const outcome       = solved ? 1 : 0;
  const expected      = expectedScore(currentRating, problemRating);
  const K             = attemptCount < K_THRESHOLD ? K_HIGH : K_LOW;

  let delta = K * (outcome - expected);

  // Reduce gain if the student leaned heavily on pseudocode hints
  if (solved && hintLevel >= 3) {
    delta = delta * 0.5;
  }

  const newRating = Math.max(600, Math.round(currentRating + delta));
  return { newRating, delta: Math.round(delta) };
};

/**
 * Convert a difficulty string to its fixed problem Elo rating.
 * Exposed so other services can use it without reimporting the map.
 */
exports.difficultyToRating = (difficulty) =>
  DIFFICULTY_RATING[difficulty] || 1300;

/**
 * Determine which difficulty the user should be recommended next
 * based on their average Elo across all rated topics.
 * This is the Zone of Proximal Development (ZPD) mapping.
 *
 * @param {Map} skillRatings - User's skill_ratings Map from MongoDB
 * @returns {'easy'|'medium'|'hard'}
 */
exports.getZPDDifficulty = (skillRatings) => {
  const eloValues = [];
  for (const [key, val] of skillRatings) {
    if (!key.startsWith('bkt_')) eloValues.push(val);
  }
  if (eloValues.length === 0) return 'easy';
  const avg = eloValues.reduce((a, b) => a + b, 0) / eloValues.length;
  if (avg < 1100) return 'easy';
  if (avg < 1400) return 'medium';
  return 'hard';
};
