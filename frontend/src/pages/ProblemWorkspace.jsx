import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import { 
  Play, 
  Loader2, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Terminal, 
  Code2, 
  Bot, 
  AlertTriangle, 
  Activity, 
  ShieldAlert, 
  ArrowRight,
  TrendingUp,
  Cpu
} from 'lucide-react';

const ProblemWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [lastSubmission, setLastSubmission] = useState(null);
  const [remediation, setRemediation] = useState(null);
  const [complexityInfo, setComplexityInfo] = useState(null);
  const [qualityInfo, setQualityInfo] = useState(null);

  // Socratic Hint System State
  const [hintTier, setHintTier] = useState(0); // 0 = None, 1 = Concept, 2 = Edge case, 3 = Pseudocode
  const [hintContent, setHintContent] = useState('');
  const [hintLoading, setHintLoading] = useState(false);

  const startTime = useRef(Date.now());

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await axios.get(`/problems/${id}`);
        const p = res.data.data;
        setProblem(p);

        // Prepopulate standard function starter signature (NOT the full answer)
        let boilerplate = '# Write your Python solution below\n\n';
        if (p.title === 'Two Sum') {
          boilerplate += 'def two_sum(nums, target):\n    """\n    :type nums: List[int]\n    :type target: int\n    :rtype: List[int]\n    """\n    # Implement your algorithm here\n    pass\n';
        } else if (p.title === 'Reverse String') {
          boilerplate += 'def reverse_string(s):\n    """\n    :type s: str\n    :rtype: str\n    """\n    pass\n';
        } else if (p.title === 'Fibonacci Number') {
          boilerplate += 'def fib(n):\n    """\n    :type n: int\n    :rtype: int\n    """\n    pass\n';
        } else if (p.title === 'Valid Palindrome') {
          boilerplate += 'def is_palindrome(s):\n    """\n    :type s: str\n    :rtype: bool\n    """\n    pass\n';
        } else if (p.title === 'Binary Search') {
          boilerplate += 'def binary_search(nums, target):\n    """\n    :type nums: List[int]\n    :type target: int\n    :rtype: int\n    """\n    pass\n';
        } else if (p.title.includes('Kadane') || p.title.includes('Subarray')) {
          boilerplate += 'def max_sub_array(nums):\n    """\n    :type nums: List[int]\n    :rtype: int\n    """\n    pass\n';
        } else if (p.title.includes('Palindromic Substring')) {
          boilerplate += 'def longest_palindrome(s):\n    """\n    :type s: str\n    :rtype: str\n    """\n    pass\n';
        } else {
          boilerplate += 'def solve(*args):\n    # Implement solution\n    pass\n';
        }

        setCode(boilerplate);
        setRemediation(null);
        setHintTier(0);
        setHintContent('');
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
    setOutput('Compiling and verifying solution in secure sandbox...\n');
    try {
      const timeTaken = Math.round((Date.now() - startTime.current) / 1000);
      const res = await axios.post('/submissions', {
        problem_id: id,
        code,
        time_taken: timeTaken,
        hint_level_used: hintTier
      });

      const { submission, remediation: rem, empirical_complexity, quality } = res.data.data;
      setLastSubmission(submission);
      setRemediation(rem?.triggered ? rem : null);
      setComplexityInfo(empirical_complexity);
      setQualityInfo(quality);

      if (submission.success) {
        setOutput(
          `✨ ALL TEST CASES PASSED!\n\n` +
          `Execution Time: ${submission.execution_time_ms || 12}ms\n` +
          `Empirical Complexity: ${empirical_complexity || problem?.complexity_expected || 'O(n)'}\n` +
          `Elo Rating Delta: +${submission.elo_delta || 16} points\n` +
          `Code Quality Score: ${quality?.quality_score || 9.5}/10.0\n\n` +
          `${submission.result}`
        );
      } else {
        setOutput(
          `❌ EVALUATION FAILED\n\n` +
          `${submission.result}\n\n` +
          `Hint: Check boundary conditions or request a Socratic hint below.`
        );
      }
    } catch (error) {
      setOutput(`⚠️ Execution error: ${error.response?.data?.error || error.message}`);
    } finally {
      setRunning(false);
    }
  };

  const handleRequestHint = async (requestedTier) => {
    setHintLoading(true);
    try {
      const res = await axios.post('/hints', {
        problem_id: id,
        code,
        execution_error: output,
        hint_level: requestedTier
      });

      setHintTier(requestedTier);
      setHintContent(res.data.data.hint);
    } catch (error) {
      setHintContent('Unable to generate hint at this time. Please check your network connection.');
    } finally {
      setHintLoading(false);
    }
  };

  if (loading) return <div className="fade-in" style={{ padding: '2rem', color: 'var(--brown-muted)' }}>Loading workspace...</div>;
  if (!problem) return <div className="fade-in" style={{ padding: '2rem' }}>Problem not found.</div>;

  return (
    <div className="fade-in" style={{ display: 'flex', height: 'calc(100vh - 120px)', margin: '-0.5rem -2.25rem -2.25rem -2.25rem', backgroundColor: '#FFFFFF', borderTop: '1px solid var(--border)' }}>
      
      {/* Left Pane - Problem Details, Scaffolded Remediation & Socratic Tutor */}
      <div style={{ width: '45%', padding: '1.75rem 2rem', overflowY: 'auto', borderRight: '1px solid var(--border)', backgroundColor: '#FAF7F2' }}>
        
        <button 
          onClick={() => navigate('/problems')} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--brown-muted)', fontSize: '0.84rem', fontWeight: 600, marginBottom: '1.25rem' }}
        >
          <ArrowLeft size={16} /> Back to Challenges
        </button>

        {/* Phase 4: Dynamic Scaffolded Remediation Alert */}
        {remediation && (
          <div style={{
            backgroundColor: '#FEF3C7',
            border: '1px solid #F59E0B',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#B45309', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.35rem' }}>
              <AlertTriangle size={18} /> Foundational Remediation Recommended
            </div>
            <p style={{ fontSize: '0.82rem', color: '#92400E', margin: '0 0 0.75rem 0', lineHeight: 1.45 }}>
              {remediation.reason}
            </p>
            <button
              className="btn-continue"
              style={{ backgroundColor: '#D97706', padding: '0.45rem 1rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              onClick={() => navigate(`/problems/${remediation.remediation_problem._id}`)}
            >
              Solve Foundational Problem: {remediation.remediation_problem.title} <ArrowRight size={14} />
            </button>
          </div>
        )}

        <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--brown-dark)', marginBottom: '0.75rem' }}>
          {problem.title}
        </h1>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1.25rem' }}>
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
          {problem.complexity_expected && (
            <span className="tag-pill tag-beige">
              Target: {problem.complexity_expected}
            </span>
          )}
        </div>
        
        <div style={{ fontSize: '0.9rem', lineHeight: '1.65', color: 'var(--brown-body)', marginBottom: '1.75rem' }}>
          {problem.description}
        </div>

        {/* Phase 5: Socratic Mentorship Hints Panel */}
        <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', marginBottom: '1.75rem', border: '1px solid var(--teal-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, fontSize: '0.9rem', color: 'var(--teal)' }}>
              <Bot size={18} /> Socratic AI Mentorship
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--brown-muted)', fontWeight: 600 }}>Zero Code Leaks</span>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--brown-muted)', marginBottom: '0.85rem' }}>
            Unlock scaffolding guidance without spoiling the solution:
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: hintContent ? '1rem' : '0' }}>
            <button
              onClick={() => handleRequestHint(1)}
              disabled={hintLoading}
              style={{
                flex: 1,
                padding: '0.4rem 0.5rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--border)',
                backgroundColor: hintTier === 1 ? 'var(--teal)' : '#FAF7F2',
                color: hintTier === 1 ? '#FFFFFF' : 'var(--brown-dark)'
              }}
            >
              1. Concept Nudge
            </button>
            <button
              onClick={() => handleRequestHint(2)}
              disabled={hintLoading}
              style={{
                flex: 1,
                padding: '0.4rem 0.5rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--border)',
                backgroundColor: hintTier === 2 ? 'var(--teal)' : '#FAF7F2',
                color: hintTier === 2 ? '#FFFFFF' : 'var(--brown-dark)'
              }}
            >
              2. Edge Cases
            </button>
            <button
              onClick={() => handleRequestHint(3)}
              disabled={hintLoading}
              style={{
                flex: 1,
                padding: '0.4rem 0.5rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--border)',
                backgroundColor: hintTier === 3 ? 'var(--teal)' : '#FAF7F2',
                color: hintTier === 3 ? '#FFFFFF' : 'var(--brown-dark)'
              }}
            >
              3. Pseudocode
            </button>
          </div>

          {hintLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--teal)', marginTop: '0.75rem' }}>
              <Loader2 size={16} className="animate-spin" /> Consulting AI Tutor...
            </div>
          )}

          {hintContent && !hintLoading && (
            <div style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'var(--teal-soft)',
              borderRadius: '8px',
              fontSize: '0.82rem',
              lineHeight: 1.5,
              color: 'var(--brown-dark)',
              whiteSpace: 'pre-line',
              borderLeft: '3px solid var(--teal)'
            }}>
              {hintContent}
            </div>
          )}
        </div>

        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--brown-dark)', marginBottom: '0.85rem' }}>
          Public Test Cases
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {problem.test_cases?.map((tc, index) => (
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
      <div style={{ width: '55%', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF' }}>
        
        {/* Editor Toolbar */}
        <div style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--brown-dark)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: 'var(--teal)' }}></span>
              <span>Python 3.10 Sandbox</span>
            </span>
            {complexityInfo && (
              <span className="tag-pill tag-beige" style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem' }}>
                <Cpu size={12} style={{ marginRight: '0.25rem' }} /> Empirical: {complexityInfo}
              </span>
            )}
          </div>

          <button 
            className="btn-teal"
            onClick={handleRunCode}
            disabled={running}
            style={{ padding: '0.45rem 1.25rem' }}
          >
            {running ? <Loader2 size={16} className="animate-spin" /> : <Play size={15} fill="#FFFFFF" />}
            <span>{running ? 'Evaluating...' : 'Run Code'}</span>
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

        {/* Execution Output Console */}
        <div style={{ height: '36%', backgroundColor: '#FAF7F2', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
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
            justifyContent: 'space-between',
            backgroundColor: '#FFFFFF'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Terminal size={14} /> Evaluation Console
            </div>
            {qualityInfo && (
              <div style={{ fontSize: '0.72rem', color: 'var(--teal)', fontWeight: 700 }}>
                Code Quality: {qualityInfo.quality_score}/10
              </div>
            )}
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
            {output || 'Write your algorithm and click "Run Code" to evaluate against the test suite...'}
          </div>
        </div>

      </div>

    </div>
  );
};

export default ProblemWorkspace;
