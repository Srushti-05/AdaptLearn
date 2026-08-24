import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, ArrowRight, Search, CheckCircle2, Sparkles, Filter } from 'lucide-react';

const ProblemsList = ({ searchQuery = '' }) => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [localSearch, setLocalSearch] = useState('');

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await axios.get('/problems');
        setProblems(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  const activeSearch = searchQuery || localSearch;

  const filteredProblems = problems.filter((p) => {
    const matchesDifficulty = selectedDifficulty === 'all' || p.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
    const matchesSearch = 
      !activeSearch ||
      p.title.toLowerCase().includes(activeSearch.toLowerCase()) ||
      p.concept_tags.some(tag => tag.toLowerCase().includes(activeSearch.toLowerCase()));
    return matchesDifficulty && matchesSearch;
  });

  if (loading) return <div className="fade-in" style={{ padding: '2rem', color: 'var(--brown-muted)' }}>Loading algorithm challenges...</div>;

  return (
    <div className="fade-in">
      {/* Header & Filter Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="learning-title" style={{ fontSize: '1.6rem' }}>
            <span className="text-brown">Coding </span>
            <span className="text-teal">Challenges</span>
          </h1>
          <p className="learning-subtitle">
            Practice foundational and advanced algorithms with automated Python execution.
          </p>
        </div>

        {/* Difficulty Filter Pills */}
        <div style={{ display: 'flex', gap: '0.45rem', backgroundColor: '#FFFFFF', padding: '0.35rem', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border)' }}>
          {['all', 'easy', 'medium', 'hard'].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.78rem',
                fontWeight: 600,
                textTransform: 'capitalize',
                backgroundColor: selectedDifficulty === diff ? 'var(--teal)' : 'transparent',
                color: selectedDifficulty === diff ? '#FFFFFF' : 'var(--brown-muted)',
                transition: 'all var(--transition-fast)'
              }}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Problems List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filteredProblems.map((problem) => {
          const isEasy = problem.difficulty === 'easy';
          const isMedium = problem.difficulty === 'medium';
          
          return (
            <div 
              key={problem._id} 
              className="card card-hover" 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '1.25rem 1.75rem',
                cursor: 'pointer'
              }}
              onClick={() => navigate(`/problems/${problem._id}`)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: isEasy ? 'var(--teal-soft)' : (isMedium ? 'var(--beige-soft)' : '#FEE2E2'),
                  color: isEasy ? 'var(--teal)' : (isMedium ? 'var(--beige-text)' : '#DC2626'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  flexShrink: 0
                }}>
                  <Code2 size={20} />
                </div>

                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--brown-dark)', marginBottom: '0.35rem' }}>
                    {problem.title}
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {problem.concept_tags.map(tag => (
                      <span key={tag} className="tag-pill tag-teal" style={{ fontSize: '0.72rem' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <span 
                  className="tag-pill"
                  style={{
                    backgroundColor: isEasy ? 'var(--teal-soft)' : (isMedium ? 'var(--beige-soft)' : '#FEE2E2'),
                    color: isEasy ? 'var(--teal)' : (isMedium ? 'var(--beige-text)' : '#DC2626'),
                    textTransform: 'uppercase',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.3rem 0.75rem'
                  }}
                >
                  {problem.difficulty}
                </span>

                <button 
                  className="btn-continue" 
                  style={{ padding: '0.45rem 1.15rem' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/problems/${problem._id}`);
                  }}
                >
                  Solve <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}

        {filteredProblems.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <Sparkles size={32} color="var(--teal)" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brown-dark)' }}>No challenges match your search</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--brown-muted)', marginTop: '0.25rem' }}>
              Try adjusting your filter or search query.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemsList;
