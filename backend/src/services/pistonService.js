const axios = require('axios');
const { spawn } = require('child_process');

const PISTON_API_URL = process.env.PISTON_API_URL || 'https://emkc.org/api/v2/piston';

const executeLocally = (code, input = '') => {
  return new Promise((resolve) => {
    const pyCmd = process.platform === 'win32' ? 'python' : 'python3';
    const pyProcess = spawn(pyCmd, ['-u', '-c', code]);

    let stdout = '';
    let stderr = '';
    let isFinished = false;

    const timer = setTimeout(() => {
      if (!isFinished) {
        isFinished = true;
        try {
          pyProcess.kill();
        } catch (_) {}
        resolve({
          code: 1,
          stdout: stdout,
          stderr: 'Time Limit Exceeded (3000ms)'
        });
      }
    }, 4000);

    if (input) {
      pyProcess.stdin.write(input);
    }
    pyProcess.stdin.end();

    pyProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pyProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pyProcess.on('error', (err) => {
      if (!isFinished) {
        isFinished = true;
        clearTimeout(timer);
        resolve({
          code: 1,
          stdout: '',
          stderr: `Execution error: ${err.message}`
        });
      }
    });

    pyProcess.on('close', (exitCode) => {
      if (!isFinished) {
        isFinished = true;
        clearTimeout(timer);
        resolve({
          code: exitCode || 0,
          stdout: stdout,
          stderr: stderr
        });
      }
    });
  });
};

// Run Python code (Piston with local fallback)
exports.executeCode = async (code, input = '') => {
  try {
    const response = await axios.post(`${PISTON_API_URL}/execute`, {
      language: 'python',
      version: '3.10.0',
      files: [
        {
          content: code
        }
      ],
      stdin: input,
      args: [],
      compile_timeout: 10000,
      run_timeout: 3000,
      compile_memory_limit: -1,
      run_memory_limit: -1
    }, { timeout: 3000 });

    if (response.data && response.data.run) {
      return response.data.run;
    }
  } catch (error) {
    // Piston public API is restricted / unavailable; fallback to local python environment
    // console.log('Piston unavailable, executing locally...');
  }

  return await executeLocally(code, input);
};

