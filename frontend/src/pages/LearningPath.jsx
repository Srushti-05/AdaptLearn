import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Check, 
  BookOpen, 
  Code2, 
  BarChart3, 
  Trophy, 
  Lock, 
  Play, 
  ChevronDown, 
  Clock, 
  CheckCircle2, 
  Target,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LearningPath = () => {
  const navigate = useNavigate();
  const [learningData, setLearningData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLearningPath = async () => {
      try {
        const res = await axios.get('/adaptive/learning-path');
        setLearningData(res.data.data);
      } catch (error) {
        console.error('Error fetching learning path:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLearningPath();
  }, []);

  const getModuleIcon = (iconName) => {
    switch (iconName) {
      case 'check': return <Check size={20} strokeWidth={2.6} />;
      case 'book': return <BookOpen size={20} strokeWidth={2.2} />;
      case 'code': return <Code2 size={20} strokeWidth={2.2} />;
      case 'chart': return <BarChart3 size={20} strokeWidth={2.2} />;
      case 'trophy': return <Trophy size={20} strokeWidth={2.2} />;
      default: return <BookOpen size={20} strokeWidth={2.2} />;
    }
  };

  const modules = learningData?.modules || [];
  const overallProgress = learningData?.overallProgress || 0;
  const totalSolved = learningData?.totalSolved || 0;
  const totalAvailable = learningData?.totalAvailable || 7;

  return (
    <div className="fade-in">
      {/* Top Header & Dynamic DAG Progression Roadmap */}
      <div className="learning-path-header">
        <div>
          <h1 className="learning-title">
            <span className="text-brown">Your </span>
            <span className="text-teal">Learning Path</span>
          </h1>
          <p className="learning-subtitle">
            Curriculum governed by prerequisite dependency graphs (DAG) and Bayesian mastery evaluation.
          </p>
        </div>

        {/* Dynamic Nodes */}
        <div className="roadmap-container">
          <svg className="roadmap-svg-line" width="280" height="40" viewBox="0 0 280 40" fill="none">
            <path 
              d="M 15 20 Q 55 5, 80 20 T 145 20 T 210 20 T 265 20" 
              stroke="#DCD2C5" 
              strokeWidth="1.5" 
              strokeDasharray="4 4" 
            />
          </svg>

          <div className="roadmap-nodes">
            {modules.map((m, idx) => {
              const nodeClass = m.status === 'completed' ? 'teal' : (m.status === 'in_progress' ? 'beige' : 'mint');
              return (
                <div 
                  key={m.id || idx} 
                  className={`roadmap-node ${nodeClass}`}
                  title={`${m.title} (${m.status})`}
                >
                  {m.status === 'completed' ? <Check size={16} strokeWidth={2.5} /> : (m.status === 'locked' ? <Lock size={15} /> : getModuleIcon(m.icon))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Learning Module Cards */}
      <div className="learning-modules-list">
        {modules.map((mod) => {
          const isCompleted = mod.status === 'completed';
          const isLocked = mod.status === 'locked';
          const isInProgress = mod.status === 'in_progress';

          return (
            <div key={mod.id} className={`module-card ${isLocked ? 'locked' : ''}`}>
              <div className="module-chevron-icon" title="View details">
                <ChevronDown size={18} />
              </div>

              <div className="module-left-indicator">
                <div className={`module-icon-circle ${mod.status}`}>
                  {isCompleted ? <Check size={22} strokeWidth={2.6} /> : (isLocked ? <Lock size={18} strokeWidth={2.2} /> : getModuleIcon(mod.icon))}
                </div>
                <div className={`module-vertical-line ${mod.status}`}></div>
              </div>

              <div className="module-center-content">
                <div>
                  <div className="module-title-row">
                    <h3 className="module-title">{mod.title}</h3>
                  </div>
                  <p className="module-desc">{mod.description}</p>
                  
                  <div className="module-tags-row">
                    {mod.tags?.map((t) => (
                      <span key={t} className={`tag-pill ${isCompleted ? 'tag-teal' : 'tag-beige'}`}>
                        {t}
                      </span>
                    ))}
                    {mod.prerequisites && mod.prerequisites.length > 0 && (
                      <span className="tag-pill" style={{ backgroundColor: '#FEE2E2', color: '#DC2626', fontSize: '0.72rem' }}>
                        Requires: {mod.prerequisites.join(', ')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="module-challenges-count">
                  {mod.solvedChallenges} / {mod.totalChallenges} CHALLENGES SOLVED
                </div>
              </div>

              <div className="module-right-status">
                <div className="progress-header">
                  <span className="progress-pct-text">{mod.progressPercent}%</span>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${mod.progressPercent}%` }}></div>
                  </div>
                </div>

                {isCompleted && (
                  <div className="status-completed-label">
                    <CheckCircle2 size={16} strokeWidth={2.4} />
                    <span>Mastered</span>
                  </div>
                )}

                {isInProgress && (
                  <button 
                    className="btn-continue"
                    onClick={() => navigate('/problems')}
                  >
                    <Play size={13} fill="#FFFFFF" strokeWidth={0} />
                    <span>Practice</span>
                  </button>
                )}

                {isLocked && (
                  <div className="locked-status-box">
                    <Lock size={18} strokeWidth={2} color="var(--brown-muted)" />
                    <div className="locked-title">Locked</div>
                    <div className="locked-subtitle">Master prerequisites to unlock</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Progress Dashboard */}
      <div className="bottom-dashboard-panel">
        
        {/* Overall Progress */}
        <div className="stat-item">
          <div className="stat-label-row">Curriculum Completion</div>
          <div className="stat-value">{overallProgress}%</div>
          <div className="mini-progress-bar">
            <div className="mini-progress-fill" style={{ width: `${overallProgress}%` }}></div>
          </div>
        </div>

        {/* Challenges Solved */}
        <div className="stat-item">
          <div className="stat-label-row">
            <Check size={14} color="var(--teal)" strokeWidth={2.5} />
            <span>Platform Problems Solved</span>
          </div>
          <div className="stat-value">
            {totalSolved} <span className="stat-value-sub">/ {totalAvailable}</span>
          </div>
        </div>

        {/* Knowledge Model */}
        <div className="stat-item">
          <div className="stat-label-row">
            <Target size={14} color="var(--teal)" strokeWidth={2.2} />
            <span>Knowledge Model</span>
          </div>
          <div className="stat-value" style={{ fontSize: '1.05rem', marginTop: '0.2rem' }}>
            BKT + Elo Active
          </div>
        </div>

        {/* Motivational Card */}
        <div className="motivational-card">
          <div className="motivational-icon-circle">
            <Target size={18} strokeWidth={2.3} />
          </div>
          <div>
            <div className="motivational-title">Adaptive Progression Active 🚀</div>
            <div className="motivational-desc">Challenges auto-scale as your competency develops.</div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default LearningPath;
