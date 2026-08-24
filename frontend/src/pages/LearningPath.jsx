import React, { useState } from 'react';
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
  Target 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LearningPath = () => {
  const navigate = useNavigate();
  const [activeTooltip, setActiveTooltip] = useState(null);

  const roadmapMilestones = [
    { id: 1, type: 'teal', icon: <Check size={16} strokeWidth={2.5} />, label: 'Foundations (Completed)' },
    { id: 2, type: 'beige', icon: <BookOpen size={16} strokeWidth={2.2} />, label: 'Data Structures (In Progress)' },
    { id: 3, type: 'mint', icon: <Code2 size={16} strokeWidth={2.2} />, label: 'Algorithms (Upcoming)' },
    { id: 4, type: 'beige', icon: <BarChart3 size={16} strokeWidth={2.2} />, label: 'Advanced Optimization' },
    { id: 5, type: 'mint', icon: <Trophy size={16} strokeWidth={2.2} />, label: 'Algorithm Master' }
  ];

  return (
    <div className="fade-in">
      {/* Top Header & Roadmap */}
      <div className="learning-path-header">
        <div>
          <h1 className="learning-title">
            <span className="text-brown">Your </span>
            <span className="text-teal">Learning Path</span>
          </h1>
          <p className="learning-subtitle">
            Follow this AI-curated curriculum to master algorithms.
          </p>
        </div>

        {/* Subtle Decorative Roadmap */}
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
            {roadmapMilestones.map((m) => (
              <div 
                key={m.id} 
                className={`roadmap-node ${m.type}`}
                title={m.label}
                onMouseEnter={() => setActiveTooltip(m.label)}
                onMouseLeave={() => setActiveTooltip(null)}
              >
                {m.icon}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main 3 Learning Module Cards */}
      <div className="learning-modules-list">
        
        {/* CARD 1: Completed */}
        <div className="module-card">
          <div className="module-chevron-icon" title="View details">
            <ChevronDown size={18} />
          </div>

          <div className="module-left-indicator">
            <div className="module-icon-circle completed">
              <Check size={22} strokeWidth={2.6} />
            </div>
            <div className="module-vertical-line completed"></div>
          </div>

          <div className="module-center-content">
            <div>
              <div className="module-title-row">
                <h3 className="module-title">Programming Basics</h3>
              </div>
              <p className="module-desc">Variables, loops, and conditional statements.</p>
              
              <div className="module-tags-row">
                <span className="tag-pill tag-teal">Variables</span>
                <span className="tag-pill tag-teal">Loops</span>
                <span className="tag-pill tag-teal">Conditionals</span>
                <span className="tag-pill tag-teal">IO</span>
                <span className="tag-pill tag-teal">Operators</span>
              </div>
            </div>

            <div className="module-challenges-count">5 CHALLENGES</div>
          </div>

          <div className="module-right-status">
            <div className="progress-header">
              <span className="progress-pct-text">100%</span>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div className="status-completed-label">
              <CheckCircle2 size={16} strokeWidth={2.4} />
              <span>Completed</span>
            </div>
          </div>
        </div>

        {/* CARD 2: In Progress */}
        <div className="module-card">
          <div className="module-chevron-icon" title="View details">
            <ChevronDown size={18} />
          </div>

          <div className="module-left-indicator">
            <div className="module-icon-circle in-progress">
              <BookOpen size={20} strokeWidth={2.2} />
            </div>
            <div className="module-vertical-line in-progress"></div>
          </div>

          <div className="module-center-content">
            <div>
              <div className="module-title-row">
                <h3 className="module-title">Data Structures Crash Course</h3>
              </div>
              <p className="module-desc">Arrays, Hashmaps, and basic Strings manipulation.</p>
              
              <div className="module-tags-row">
                <span className="tag-pill tag-beige">Arrays</span>
                <span className="tag-pill tag-beige">Hashmaps</span>
                <span className="tag-pill tag-beige">Strings</span>
                <span className="tag-pill tag-beige">Sets</span>
                <span className="tag-pill tag-beige">Maps</span>
              </div>
            </div>

            <div className="module-challenges-count">8 CHALLENGES</div>
          </div>

          <div className="module-right-status">
            <div className="progress-header">
              <span className="progress-pct-text">40%</span>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: '40%' }}></div>
              </div>
            </div>

            <button 
              className="btn-continue"
              onClick={() => navigate('/problems')}
            >
              <Play size={13} fill="#FFFFFF" strokeWidth={0} />
              <span>Continue</span>
            </button>
          </div>
        </div>

        {/* CARD 3: Locked */}
        <div className="module-card locked">
          <div className="module-chevron-icon" title="View details">
            <ChevronDown size={18} />
          </div>

          <div className="module-left-indicator">
            <div className="module-icon-circle locked">
              <Lock size={18} strokeWidth={2.2} />
            </div>
            <div className="module-vertical-line locked"></div>
          </div>

          <div className="module-center-content">
            <div>
              <div className="module-title-row">
                <h3 className="module-title">Two Pointers & Sliding Window</h3>
              </div>
              <p className="module-desc">Master efficient searching and subarray problems.</p>
              
              <div className="module-tags-row">
                <span className="tag-pill tag-teal">Two Pointers</span>
                <span className="tag-pill tag-teal">Sliding Window</span>
                <span className="tag-pill tag-teal">Subarrays</span>
                <span className="tag-pill tag-teal">Patterns</span>
              </div>
            </div>

            <div className="module-challenges-count">12 CHALLENGES</div>
          </div>

          <div className="module-right-status">
            <div className="locked-status-box">
              <Lock size={18} strokeWidth={2} color="var(--brown-muted)" />
              <div className="locked-title">Locked</div>
              <div className="locked-subtitle">Complete previous topics to unlock</div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Progress Dashboard */}
      <div className="bottom-dashboard-panel">
        
        {/* Overall Progress */}
        <div className="stat-item">
          <div className="stat-label-row">Overall Progress</div>
          <div className="stat-value">28%</div>
          <div className="mini-progress-bar">
            <div className="mini-progress-fill" style={{ width: '28%' }}></div>
          </div>
        </div>

        {/* Challenges Solved */}
        <div className="stat-item">
          <div className="stat-label-row">
            <Check size={14} color="var(--teal)" strokeWidth={2.5} />
            <span>Challenges Solved</span>
          </div>
          <div className="stat-value">
            13 <span className="stat-value-sub">/ 45</span>
          </div>
        </div>

        {/* Time Spent */}
        <div className="stat-item">
          <div className="stat-label-row">
            <Clock size={14} color="var(--teal)" strokeWidth={2.2} />
            <span>Time Spent</span>
          </div>
          <div className="stat-value">8h 24m</div>
        </div>

        {/* Rank */}
        <div className="stat-item">
          <div className="stat-label-row">
            <Trophy size={14} color="#D97706" strokeWidth={2.2} />
            <span>Rank</span>
          </div>
          <div className="stat-value">Top 24%</div>
        </div>

        {/* Motivational Card */}
        <div className="motivational-card">
          <div className="motivational-icon-circle">
            <Target size={18} strokeWidth={2.3} />
          </div>
          <div>
            <div className="motivational-title">Keep Going! 🚀</div>
            <div className="motivational-desc">You're doing great. Consistency is the key!</div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default LearningPath;
