/**
 * sandboxService.js  —  Phase 1: Secure Code Execution
 * ─────────────────────────────────────────────────────
 * Replaces pistonService.js with a 3-tier execution strategy:
 *
 *  Tier 1 ── Judge0 self-hosted (Docker, fully sandboxed)
 *  Tier 2 ── Piston public API  (network fallback)
 *  Tier 3 ── Local Python       (last resort, dev-only)
 *
 * Every tier returns the same result shape so the caller
 * (submissionController) never needs to know which tier ran.
 *
 * Result shape per test case:
 *  {
 *    passed:    boolean,
 *    stdout:    string,
 *    stderr:    string,
 *    time_ms:   number,
 *    memory_kb: number,
 *    expected:  string
 *  }
 */

const axios  = require('axios');
const { spawn } = require('child_process');

// ── Configuration ─────────────────────────────────────────────
const JUDGE0_URL   = process.env.JUDGE0_URL   || 'http://localhost:2358';
const JUDGE0_TOKEN = process.env.JUDGE0_TOKEN || 'adaptlearn_sandbox_token_2024';
const PISTON_URL   = 'https://emkc.org/api/v2/piston';

// Judge0 CE language IDs
// Full list: https://github.com/judge0/judge0/blob/master/docs/api/languages/list.md
const JUDGE0_LANG_IDS = {
  python:     71,   // Python 3.8.1
  cpp:        54,   // C++ (GCC 9.2.0)
  java:       62,   // Java (OpenJDK 13.0.1)
  javascript: 93,   // JavaScript (Node.js 12.14.0)
};

// ── Helpers ───────────────────────────────────────────────────

/**
 * Build the full code to execute for a single test case.
 * If the test case input is Python code (contains function call or print),
 * it's appended to the user's code.  Otherwise it goes to stdin.
 */
const buildTestPayload = (userCode, testCase, language = 'python') => {
  if (!testCase.input) {
    return { codeToRun: userCode, stdin: '' };
  }
  const isCodeInput = testCase.input.includes('(') || testCase.input.includes('print');
  if (isCodeInput) {
    let testCall = testCase.input;
    if (language === 'javascript') {
      testCall = testCall.replace(/print\(/g, 'console.log(');
    }
    return { codeToRun: `${userCode}\n\n${testCall}`, stdin: '' };
  }
  return { codeToRun: userCode, stdin: testCase.input };
};

/** Sleep utility for polling Judge0 */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Tier 1: Judge0 ────────────────────────────────────────────

/**
 * Submit one test case to Judge0 and wait for the result.
 * Returns null if Judge0 is unavailable (triggers fallback).
 */
const runOnJudge0 = async (code, stdin, language) => {
  const langId = JUDGE0_LANG_IDS[language] || JUDGE0_LANG_IDS.python;

  let token;
  try {
    const submitRes = await axios.post(
      `${JUDGE0_URL}/submissions?base64_encoded=false&wait=false`,
      {
        source_code:   code,
        language_id:   langId,
        stdin:         stdin || '',
        cpu_time_limit:    3,
        memory_limit:  131072,  // 128 MB in KB
      },
      {
        headers:  { 'X-Auth-Token': JUDGE0_TOKEN },
        timeout:  4000,
      }
    );
    token = submitRes.data.token;
  } catch {
    return null; // Judge0 not reachable → use fallback
  }

  // Poll until status id >= 3 (3 = Accepted, 4+ = various errors)
  for (let attempt = 0; attempt < 15; attempt++) {
    await sleep(400);
    try {
      const { data } = await axios.get(
        `${JUDGE0_URL}/submissions/${token}?base64_encoded=false`,
        { headers: { 'X-Auth-Token': JUDGE0_TOKEN }, timeout: 3000 }
      );
      if (data.status && data.status.id >= 3) {
        return {
          stdout:    (data.stdout    || '').trim(),
          stderr:    (data.stderr    || data.compile_output || '').trim(),
          time_ms:   Math.round((parseFloat(data.time) || 0) * 1000),
          memory_kb: data.memory || 0,
          exit_code: data.status.id === 3 ? 0 : 1,
        };
      }
    } catch {
      // transient polling error — keep retrying
    }
  }
  return null; // timed out waiting → use fallback
};

// ── Tier 2: Piston public API ─────────────────────────────────

const runOnPiston = async (code, stdin, language) => {
  try {
    const res = await axios.post(
      `${PISTON_URL}/execute`,
      {
        language: language === 'cpp' ? 'c++' : language,
        version:  '*',
        files:    [{ content: code }],
        stdin:    stdin || '',
      },
      { timeout: 8000 }
    );
    if (res.data && res.data.run) {
      return {
        stdout:    (res.data.run.stdout || '').trim(),
        stderr:    (res.data.run.stderr || '').trim(),
        time_ms:   0,   // Piston doesn't expose timing
        memory_kb: 0,
        exit_code: res.data.run.code || 0,
      };
    }
  } catch {
    // Piston unavailable → Tier 3
  }
  return null;
};

// ── Tier 3: Local Python (dev fallback, Python only) ──────────

const runLocally = (code, stdin, language = 'python') => {
  return new Promise((resolve) => {
    let pyCmd, args;
    if (language === 'javascript') {
      pyCmd = 'node';
      args = ['-e', code];
    } else {
      pyCmd = process.platform === 'win32' ? 'python' : 'python3';
      args = ['-u', '-c', code];
    }
    const pyProc = spawn(pyCmd, args);
    let stdout = '', stderr = '', done = false;

    const timer = setTimeout(() => {
      if (!done) {
        done = true;
        try { pyProc.kill(); } catch (_) {}
        resolve({ stdout, stderr: 'Time Limit Exceeded (5s)', time_ms: 5000, memory_kb: 0, exit_code: 1 });
      }
    }, 5000);

    if (stdin) pyProc.stdin.write(stdin);
    pyProc.stdin.end();

    pyProc.stdout.on('data', (d) => { stdout += d.toString(); });
    pyProc.stderr.on('data', (d) => { stderr += d.toString(); });

    pyProc.on('error', (err) => {
      if (!done) {
        done = true;
        clearTimeout(timer);
        resolve({ stdout: '', stderr: `Execution error: ${err.message}`, time_ms: 0, memory_kb: 0, exit_code: 1 });
      }
    });

    pyProc.on('close', (code) => {
      if (!done) {
        done = true;
        clearTimeout(timer);
        resolve({ stdout: stdout.trim(), stderr: stderr.trim(), time_ms: 0, memory_kb: 0, exit_code: code || 0 });
      }
    });
  });
};

// ── Main export: executeCode ───────────────────────────────────

/**
 * Run user code against all test cases.
 *
 * @param {string}   userCode   - The student's submitted code
 * @param {Array}    testCases  - Array of { input, expected_output }
 * @param {string}   language   - 'python' | 'cpp' | 'java' | 'javascript'
 * @returns {Promise<Array>}    - Array of result objects (one per test case)
 *
 * Stops at the first failing test case (fail-fast).
 */
exports.executeCode = async (userCode, testCases, language = 'python') => {
  const results = [];

  for (const testCase of testCases) {
    const { codeToRun, stdin } = buildTestPayload(userCode, testCase, language);
    const expected = (testCase.expected_output || '').trim();

    // Try each tier in order
    let raw = await runOnJudge0(codeToRun, stdin, language);
    if (!raw) raw = await runOnPiston(codeToRun, stdin, language);
    if (!raw) raw = await runLocally(codeToRun, stdin, language);

    const passed = raw.exit_code === 0 && raw.stdout === expected;

    results.push({
      passed,
      stdout:    raw.stdout,
      stderr:    raw.stderr,
      time_ms:   raw.time_ms,
      memory_kb: raw.memory_kb,
      expected,
    });

    // Fail-fast: stop running remaining test cases after first failure
    if (!passed) break;
  }

  return results;
};
