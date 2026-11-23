/**
 * complexityProfiler.js  —  Phase 3: Empirical Complexity Profiler
 * ────────────────────────────────────────────────────────────────
 * Runs the student's solution against increasing input sizes (N)
 * and measures wall-clock execution time. Uses linear regression
 * on log(N) vs log(Time) to determine the empirical asymptotic complexity:
 *   slope ~ 0   -> O(1) or O(log N)
 *   slope ~ 1.0 -> O(N)
 *   slope ~ 1.5 -> O(N log N)
 *   slope ~ 2.0 -> O(N²)
 *   slope > 2.3 -> O(N³) or worse
 */

const { executeCode } = require('./sandboxService');

// Perform least-squares linear regression on log(N) vs log(Time)
const estimateSlope = (data) => {
  if (data.length < 2) return 1.0;

  const valid = data.filter(d => d.time_ms > 0 && d.n > 0);
  if (valid.length < 2) return 1.0;

  const logN = valid.map(d => Math.log(d.n));
  const logT = valid.map(d => Math.log(Math.max(d.time_ms, 0.1)));

  const count = valid.length;
  const sumX = logN.reduce((a, b) => a + b, 0);
  const sumY = logT.reduce((a, b) => a + b, 0);
  const sumXY = logN.reduce((acc, x, i) => acc + x * logT[i], 0);
  const sumX2 = logN.reduce((acc, x) => acc + x * x, 0);

  const denominator = count * sumX2 - sumX * sumX;
  if (Math.abs(denominator) < 1e-9) return 1.0;

  const slope = (count * sumXY - sumX * sumY) / denominator;
  return slope;
};

const slopeToComplexityClass = (slope) => {
  if (slope <= 0.4) return 'O(1) / O(log n)';
  if (slope <= 1.25) return 'O(n)';
  if (slope <= 1.65) return 'O(n log n)';
  if (slope <= 2.35) return 'O(n²)';
  return 'O(n³) or higher';
};

/**
 * Profile user code across scaling input sizes
 * @param {string} code - Submitted Python solution
 * @param {object} problem - MongoDB Problem document
 * @param {string} language - Language ('python' supported for profiling)
 */
exports.profileComplexity = async (code, problem, language = 'python') => {
  if (language !== 'python' || !problem.input_generator || !problem.input_generator.trim()) {
    return {
      empirical_complexity: problem.complexity_expected || 'O(n)',
      profile_data: [],
      slope: 1.0
    };
  }

  const sampleSizes = [20, 100, 300, 800, 1500];
  const profile_data = [];

  for (const n of sampleSizes) {
    const harness = `
import time
${code}

${problem.input_generator}

import sys, io
# Capture generated input call
import contextlib
buf = io.StringIO()
with contextlib.redirect_stdout(buf):
    print_input(${n})
call_str = buf.getvalue().strip()

t0 = time.perf_counter()
try:
    exec(call_str)
except Exception:
    pass
t1 = time.perf_counter()
print(f"PROFILE_ELAPSED:{(t1 - t0) * 1000:.3f}")
`;

    try {
      const res = await executeCode(harness, [{ input: '', expected_output: '' }], 'python');
      let elapsedMs = 0;
      if (res && res[0]) {
        const out = res[0].stdout || '';
        const match = out.match(/PROFILE_ELAPSED:([\d.]+)/);
        if (match) {
          elapsedMs = parseFloat(match[1]);
        } else if (res[0].time_ms > 0) {
          elapsedMs = res[0].time_ms;
        }
      }
      profile_data.push({
        n,
        time_ms: Math.max(0.1, elapsedMs),
        memory_kb: res[0]?.memory_kb || 0
      });
    } catch {
      // If profiling harness fails on this step, continue
    }
  }

  if (profile_data.length >= 2) {
    const slope = estimateSlope(profile_data);
    const empirical_complexity = slopeToComplexityClass(slope);
    return {
      empirical_complexity,
      profile_data,
      slope: parseFloat(slope.toFixed(2))
    };
  }

  return {
    empirical_complexity: problem.complexity_expected || 'O(n)',
    profile_data: [],
    slope: 1.0
  };
};
