import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import { Play, Loader2, ArrowLeft, CheckCircle2, XCircle, Sparkles, Terminal, Code2 } from 'lucide-react';

const ProblemWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [lastSubmission, setLastSubmission] = useState(null);
  
  const startTime = useRef(Date.now());

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await axios.get(`/problems/${id}`);
        const p = res.data.data;
        setProblem(p);

        // Prepopulate intelligent boilerplate
        let boilerplate = '# Write your Python solution below\n\n';
        if (p.title === 'Two Sum') {
          boilerplate += 'def two_sum(nums, target):\n    # Return a list of two indices [i, j]\n    lookup = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in lookup:\n            return [lookup[diff], i]\n        lookup[num] = i\n    return []\n';
        } else if (p.title === 'Reverse String') {
          boilerplate += 'def reverse_string(s):\n    # Reverse string and return\n    return s[::-1]\n';
        } else if (p.title === 'Fibonacci Number') {
          boilerplate += 'def fib(n):\n    if n <= 1:\n        return n\n    a, b = 0, 1\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n    return b\n';
        } else if (p.title === 'Valid Palindrome') {
          boilerplate += 'def is_palindrome(s):\n    cleaned = "".join(c.lower() for c in s if c.isalnum())\n    return cleaned == cleaned[::-1]\n';
        } else if (p.title === 'Binary Search') {
          boilerplate += 'def binary_search(nums, target):\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if nums[mid] == target:\n            return mid\n        elif nums[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1\n';
        } else {
          boilerplate += 'def solve(*args):\n    # Implement solution\n    pass\n';
        }

        setCode(boilerplate);
        startTime.current = Date.now();
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [id]);

  const handleRunCode = async () => {
    setRunning(true);
    setOutput('Compiling and executing Python test cases on AdaptLearn execution engine...\n');
    try {
      const timeTaken = Math.round((Date.now() - startTime.current) / 1000);
      const res = await axios.post('/submissions', {
        problem_id: id,
        code,
        time_taken: timeTaken
      });
      
      const sub = res.data.data;
      setLastSubmission(sub);

      if (sub.success) {
        setOutput(`✨ ALL TEST CASES PASSED!\n\n${sub.result}\n\nExecution Time: ${timeTaken}s\nTelemetry logged to your adaptive profile.`);
      } else {
        setOutput(`❌ TEST FAILED\n\n${sub.result}\n\nHint: Check your edge cases or indexing logic.`);
      }
    } catch (error) {
      setOutput(`⚠️ Execution error: ${error.response?.data?.error || error.message}`);
    } finally {
      setRunning(false);
    }
  };

  if (loading) return <div className="fade-in" style={{ padding: '2rem', color: 'var(--brown-muted)' }}>Loading workspace...</div>;
  if (!problem) return <div className="fade-in" style={{ padding: '2rem' }}>Problem not found.</div>;

  return (
    <div className="fade-in" style={{ display: 'flex', height: 'calc(100vh - 120px)', margin: '-0.5rem -2.25rem -2.25rem -2.25rem', backgroundColor: '#FFFFFF', borderTop: '1px solid var(--border)' }}>
      
      {/* Left Pane - Problem Details & Test Cases */}
      <div style={{ width: '42%', padding: '1.75rem 2rem', overflowY: 'auto', borderRight: '1px solid var(--border)', backgroundColor: '#FAF7F2' }}>
        
        <button 
          onClick={() => navigate('/problems')} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--brown-muted)', fontSize: '0.84rem', fontWeight: 600, marginBottom: '1.25rem' }}
        >
          <ArrowLeft size={16} /> Back to Challenges
        </button>

        <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--brown-dark)', marginBottom: '0.75rem' }}>
          {problem.title}
        </h1>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1.5rem' }}>
          <span 
            className="tag-pill" 
            style={{ 
              backgroundColor: problem.difficulty === 'easy' ? 'var(--teal-soft)' : (problem.difficulty === 'medium' ? 'var(--beige-soft)' : '#FEE2E2'),
              color: problem.difficulty === 'easy' ? 'var(--teal)' : (problem.difficulty === 'medium' ? 'var(--beige-text)' : '#DC2626'),
              textTransform: 'uppercase',
              fontWeight: 700
            }}
          >
            {problem.difficulty}
          </span>
          {problem.concept_tags.map(tag => (
            <span key={tag} className="tag-pill tag-teal">
              {tag}
            </span>
          ))}
        </div>
        
        <div style={{ fontSize: '0.9rem', lineHeight: '1.65', color: 'var(--brown-body)', marginBottom: '2rem' }}>
          {problem.description}
        </div>

        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--brown-dark)', marginBottom: '0.85rem' }}>
          Example Test Cases
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {problem.test_cases.map((tc, index) => (
            <div key={index} className="card" style={{ padding: '1rem 1.25rem', backgroundColor: '#FFFFFF' }}>
              <div style={{ marginBottom: '0.4rem', fontSize: '0.82rem' }}>
                <strong style={{ color: 'var(--brown-dark)' }}>Input:</strong>{' '}
                <code style={{ color: 'var(--teal)', backgroundColor: 'var(--teal-soft)', padding: '0.15rem 0.45rem', borderRadius: '4px', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem' }}>
                  {tc.input}
                </code>
              </div>
              <div style={{ fontSize: '0.82rem' }}>
                <strong style={{ color: 'var(--brown-dark)' }}>Expected Output:</strong>{' '}
                <code style={{ color: 'var(--teal)', backgroundColor: '#FFFFFF', border: '1px solid var(--teal-border)', padding: '0.15rem 0.45rem', borderRadius: '4px', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', fontWeight: 600 }}>
                  {tc.expected_output}
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Pane - Monaco Editor & Terminal Output */}
      <div style={{ width: '58%', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF' }}>
        
        {/* Editor Toolbar */}
        <div style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--brown-dark)' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: 'var(--teal)' }}></span>
            <span>Python 3.11</span>
          </div>

          <button 
            className="btn-teal"
            onClick={handleRunCode}
            disabled={running}
            style={{ padding: '0.45rem 1.25rem' }}
          >
            {running ? <Loader2 size={16} className="animate-spin" /> : <Play size={15} fill="#FFFFFF" />}
            <span>{running ? 'Executing...' : 'Run Code'}</span>
          </button>
        </div>

        {/* Monaco Editor */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Editor
            height="100%"
            defaultLanguage="python"
            theme="vs-light"
            value={code}
            onChange={(value) => setCode(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              padding: { top: 16 },
              lineHeight: 24,
              fontFamily: "'JetBrains Mono', monospace",
              scrollBeyondLastLine: false,
              automaticLayout: true
            }}
          />
        </div>

        {/* Terminal Output */}
        <div style={{ height: '34%', backgroundColor: '#FAF7F2', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            padding: '0.5rem 1.25rem',
            borderBottom: '1px solid var(--border)',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: 'var(--brown-muted)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: '#FFFFFF'
          }}>
            <Terminal size={14} /> Execution Console
          </div>

          <div style={{
            padding: '1rem 1.25rem',
            flex: 1,
            overflowY: 'auto',
            fontFamily: "'JetBrains Mono', monospace",
            color: 'var(--brown-dark)',
            whiteSpace: 'pre-wrap',
            fontSize: '0.84rem',
            lineHeight: 1.5
          }}>
            {output || 'Click "Run Code" to compile and test your Python solution...'}
          </div>
        </div>

      </div>

    </div>
  );
};

export default ProblemWorkspace;
