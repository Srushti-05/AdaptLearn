import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from './store/AuthContext';
import { 
  LayoutDashboard, 
  Code2, 
  Sparkles, 
  LineChart, 
  Trophy, 
  Bookmark, 
  Bot, 
  Check, 
  Sun, 
  ChevronDown, 
  Search, 
  Bell, 
  LogOut,
  X,
  Send,
  Zap,
  Award,
  BookOpen
} from 'lucide-react';

import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ProblemsList from './pages/ProblemsList';
import ProblemWorkspace from './pages/ProblemWorkspace';
import LearningPath from './pages/LearningPath';
import AdaptLearnLogo from './components/AdaptLearnLogo';

const Sidebar = ({ onOpenAiTutor, onOpenAchievements, onOpenBookmarks }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) return null;

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={19} /> },
    { name: 'Problems', path: '/problems', icon: <Code2 size={19} /> },
    { name: 'Learning Path', path: '/', icon: <Sparkles size={19} /> },
    { name: 'Analytics', path: '/analytics', icon: <LineChart size={19} /> },
    { name: 'Achievements', action: onOpenAchievements, icon: <Trophy size={19} /> },
    { name: 'Bookmarks', action: onOpenBookmarks, icon: <Bookmark size={19} /> },
    { name: 'AI Tutor', action: onOpenAiTutor, icon: <Bot size={19} />, badge: 'NEW' },
  ];

  return (
    <aside className="sidebar">
      {/* Official Primary Brand Logo & Title with Clear Spacing */}
      <Link to="/" className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <AdaptLearnLogo size={40} />
        </div>
        <div>
          <div className="sidebar-brand-title">AdaptLearn</div>
          <div className="sidebar-brand-subtitle">AI-Powered Platform</div>
        </div>
      </Link>

      {/* Menu Section */}
      <div className="sidebar-menu-title">MENU</div>
      
      <ul className="sidebar-nav-list">
        {navLinks.map((item) => {
          if (item.action) {
            return (
              <li key={item.name}>
                <div className="sidebar-nav-item" onClick={item.action}>
                  <div className="sidebar-nav-item-left">
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                  {item.badge && <span className="badge-new">{item.badge}</span>}
                </div>
              </li>
            );
          }

          const isActive = 
            (item.path === '/' && (location.pathname === '/' || location.pathname === '/learning-path')) ||
            (item.path !== '/' && location.pathname.startsWith(item.path));

          return (
            <li key={item.name}>
              <Link 
                to={item.path}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                <div className="sidebar-nav-item-left">
                  {item.icon}
                  <span>{item.name}</span>
                </div>
                {item.badge && <span className="badge-new">{item.badge}</span>}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Bottom 7 Day Streak Card */}
      <div className="streak-card">
        <div className="streak-header">
          <div>
            <div className="streak-number">7</div>
            <div className="streak-label">Day Streak</div>
            <div className="streak-subtext">Keep it up! 🔥</div>
          </div>
          <div className="streak-icon-box">
            <span>🔥</span>
          </div>
        </div>

        <div className="streak-days-row">
          {[
            { day: 'M', active: true },
            { day: 'T', active: true },
            { day: 'W', active: true },
            { day: 'T', active: true },
            { day: 'F', active: true },
            { day: 'S', active: false },
            { day: 'S', active: false },
          ].map((d, idx) => (
            <div key={idx} className="streak-day-col">
              <span className="streak-day-letter">{d.day}</span>
              <div className={`streak-day-dot ${d.active ? 'active' : 'inactive'}`}>
                {d.active && <Check size={11} strokeWidth={3} />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Light Mode Selector */}
      <div className="theme-toggle-pill">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sun size={16} color="#D97706" />
          <span>Light Mode</span>
        </div>
        <ChevronDown size={15} color="var(--brown-muted)" />
      </div>
    </aside>
  );
};

const Header = ({ onOpenAiTutor, searchQuery, setSearchQuery }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  if (!user) return null;

  const getPageTitle = () => {
    if (location.pathname === '/' || location.pathname === '/learning-path') return 'Overview';
    if (location.pathname === '/dashboard' || location.pathname === '/analytics') return 'Analytics';
    if (location.pathname.startsWith('/problems/')) return 'Workspace';
    if (location.pathname === '/problems') return 'Challenges';
    return 'Overview';
  };

  return (
    <header className="top-header">
      {/* Page Title / Breadcrumb */}
      <div className="header-title">{getPageTitle()}</div>

      {/* Large Rounded Search Field */}
      <div className="header-search-wrapper">
        <Search size={18} className="header-search-icon" />
        <input 
          type="text" 
          placeholder="Search topics, challenges..."
          className="header-search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Right Actions */}
      <div className="header-right-actions">
        
        {/* AI Assistant Active Badge */}
        <button className="ai-active-badge" onClick={onOpenAiTutor}>
          <Sparkles size={15} color="var(--teal)" />
          <span>AI Assistant Active</span>
        </button>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button 
            className="notification-btn" 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            title="Notifications"
          >
            <Bell size={18} />
            <div className="notification-badge">3</div>
          </button>

          {notificationsOpen && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '48px',
              width: '280px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              boxShadow: 'var(--shadow-dropdown)',
              zIndex: 100
            }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brown-dark)', marginBottom: '0.75rem' }}>
                Notifications
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.78rem' }}>
                <div style={{ padding: '0.4rem 0.5rem', background: 'var(--teal-soft)', borderRadius: '6px', color: 'var(--teal)' }}>
                  🎯 7-day streak milestone reached! Keep it going!
                </div>
                <div style={{ padding: '0.4rem 0.5rem', background: '#FAF7F2', borderRadius: '6px', color: 'var(--brown-body)' }}>
                  ✨ New adaptive recommendation available for Two Sum.
                </div>
                <div style={{ padding: '0.4rem 0.5rem', background: '#FAF7F2', borderRadius: '6px', color: 'var(--brown-body)' }}>
                  🏆 You completed Programming Basics module (100%).
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar & Profile */}
        <div style={{ position: 'relative' }}>
          <div 
            className="user-profile-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" 
              alt="Avatar" 
              className="user-avatar-img"
            />
            <div className="user-text-col">
              <div className="user-name">{user.name || 'Srushti Gujar'}</div>
              <div className="user-role">Learner</div>
            </div>
            <ChevronDown size={14} color="var(--brown-muted)" style={{ marginLeft: '0.2rem' }} />
          </div>

          {/* User Dropdown */}
          {showUserMenu && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '48px',
              width: '180px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.5rem',
              boxShadow: 'var(--shadow-dropdown)',
              zIndex: 100
            }}>
              <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--brown-muted)' }}>
                Signed in as <strong style={{ color: 'var(--brown-dark)' }}>{user.email}</strong>
              </div>
              <button 
                onClick={logout} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  padding: '0.6rem 0.5rem',
                  color: 'var(--danger)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  marginTop: '0.25rem'
                }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

// Interactive AI Tutor Modal / Drawer
const AiTutorDrawer = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello Srushti! I'm your AdaptLearn AI Tutor. I'm tracking your algorithm progress and ready to help you analyze time complexities, debug Python code, or explain concepts!"
    }
  ]);
  const [inputVal, setInputVal] = useState('');

  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userMsg = inputVal;
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setInputVal('');

    setTimeout(() => {
      let reply = "That's a great question! In Python algorithms, optimizing lookup time with a Hash Map (dictionary) reduces overall time complexity from O(n²) to O(n). Let me know if you'd like code snippets for your current problem!";
      if (userMsg.toLowerCase().includes('two sum')) {
        reply = "For Two Sum: Store each number's complement (`target - num`) in a hash map as you iterate through the list. When you encounter a complement already in the map, you immediately have your answer in O(n) time!";
      } else if (userMsg.toLowerCase().includes('streak') || userMsg.toLowerCase().includes('progress')) {
        reply = "You're on a 7-day streak! Solving 1-2 problems daily consistently reinforces memory patterns far better than weekend cramming.";
      }
      setMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
    }, 600);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(44, 34, 30, 0.35)',
      display: 'flex',
      justifyContent: 'flex-end',
      zIndex: 1000,
      backdropFilter: 'blur(2px)'
    }}>
      <div className="fade-in" style={{
        width: '420px',
        maxWidth: '100%',
        height: '100%',
        backgroundColor: '#FFFFFF',
        borderLeft: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-8px 0 30px rgba(61, 41, 33, 0.1)'
      }}>
        
        {/* Drawer Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#FAF7F2'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--teal-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal)' }}>
              <Bot size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--brown-dark)' }}>AdaptLearn AI Tutor</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--teal)', fontWeight: 600 }}>Active Guidance Engine</div>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--brown-muted)', padding: '0.35rem', borderRadius: '50%' }}>
            <X size={20} />
          </button>
        </div>

        {/* Messages Body */}
        <div style={{
          flex: 1,
          padding: '1.25rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          backgroundColor: '#FAF7F2'
        }}>
          {messages.map((m, idx) => (
            <div 
              key={idx} 
              style={{
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                padding: '0.85rem 1.1rem',
                borderRadius: m.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                backgroundColor: m.sender === 'user' ? 'var(--teal)' : '#FFFFFF',
                color: m.sender === 'user' ? '#FFFFFF' : 'var(--brown-dark)',
                fontSize: '0.85rem',
                lineHeight: 1.45,
                border: m.sender === 'user' ? 'none' : '1px solid var(--border)',
                boxShadow: 'var(--shadow-subtle)'
              }}
            >
              {m.text}
            </div>
          ))}
        </div>

        {/* Input Footer */}
        <form onSubmit={handleSend} style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          gap: '0.5rem',
          backgroundColor: '#FFFFFF'
        }}>
          <input 
            type="text" 
            placeholder="Ask AI Tutor anything..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            style={{
              flex: 1,
              padding: '0.65rem 1rem',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border)',
              outline: 'none',
              fontSize: '0.85rem',
              backgroundColor: '#FAF7F2',
              color: 'var(--brown-dark)'
            }}
          />
          <button type="submit" className="btn-teal" style={{ padding: '0.65rem 1.1rem', borderRadius: 'var(--radius-pill)' }}>
            <Send size={16} />
          </button>
        </form>

      </div>
    </div>
  );
};

// Achievements Modal
const AchievementsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const achievements = [
    { title: '7-Day Streak Hero', desc: 'Maintained a coding practice streak for 7 consecutive days.', icon: '🔥', unlocked: true },
    { title: 'First Code Execution', desc: 'Ran Python solution through the embedded compiler.', icon: '⚡', unlocked: true },
    { title: 'Basics Master', desc: 'Completed 100% of Programming Basics challenges.', icon: '🎓', unlocked: true },
    { title: 'Hash Map Specialist', desc: 'Solved 5 problems utilizing key-value lookup strategies.', icon: '🗝️', unlocked: false },
    { title: 'Algorithm Prodigy', desc: 'Solve 25 challenges with 90%+ first-try accuracy.', icon: '🏆', unlocked: false }
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(44, 34, 30, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(3px)'
    }}>
      <div className="card fade-in" style={{ width: '480px', maxWidth: '90%', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trophy size={22} color="#D97706" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--brown-dark)' }}>Your Achievements</h2>
          </div>
          <button onClick={onClose} style={{ color: 'var(--brown-muted)' }}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {achievements.map((a, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              backgroundColor: a.unlocked ? '#FAF7F2' : '#FFFFFF',
              opacity: a.unlocked ? 1 : 0.6
            }}>
              <div style={{ fontSize: '1.6rem', width: '40px', textAlign: 'center' }}>{a.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--brown-dark)' }}>{a.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--brown-muted)' }}>{a.desc}</div>
              </div>
              {a.unlocked ? (
                <span className="badge-new" style={{ background: 'var(--teal-soft)', color: 'var(--teal)' }}>Unlocked</span>
              ) : (
                <span style={{ fontSize: '0.72rem', color: 'var(--brown-muted)' }}>Locked</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Bookmarks Modal
const BookmarksModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  const navigate = useNavigate();

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(44, 34, 30, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(3px)'
    }}>
      <div className="card fade-in" style={{ width: '460px', maxWidth: '90%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bookmark size={22} color="var(--teal)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--brown-dark)' }}>Saved Challenges</h2>
          </div>
          <button onClick={onClose} style={{ color: 'var(--brown-muted)' }}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--brown-dark)' }}>Two Sum</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--brown-muted)' }}>Arrays • Hash Map • Easy</div>
            </div>
            <button className="btn-continue" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }} onClick={() => { onClose(); navigate('/problems'); }}>
              Practice
            </button>
          </div>
          <div style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--brown-dark)' }}>Binary Search</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--brown-muted)' }}>Arrays • Binary Search • Medium</div>
            </div>
            <button className="btn-continue" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }} onClick={() => { onClose(); navigate('/problems'); }}>
              Practice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const { user } = useContext(AuthContext);
  const [aiTutorOpen, setAiTutorOpen] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Router>
      {/* Full-Page Blurred AI Workspace Background & Warm Translucent Overlay */}
      <div className="app-background-layer" aria-hidden="true" />
      <div className="app-background-overlay" aria-hidden="true" />

      <div className="app-container">
        <Sidebar 
          onOpenAiTutor={() => setAiTutorOpen(true)}
          onOpenAchievements={() => setAchievementsOpen(true)}
          onOpenBookmarks={() => setBookmarksOpen(true)}
        />
        
        <div className="main-content">
          <Header 
            onOpenAiTutor={() => setAiTutorOpen(true)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          
          <main className="content-body">
            <Routes>
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
              <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
              
              {/* Learning Path is the primary showcase view at root and /learning-path */}
              <Route path="/" element={user ? <LearningPath /> : <Navigate to="/login" />} />
              <Route path="/learning-path" element={user ? <LearningPath /> : <Navigate to="/login" />} />
              
              {/* Other functional views */}
              <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
              <Route path="/analytics" element={user ? <Dashboard /> : <Navigate to="/login" />} />
              <Route path="/problems" element={user ? <ProblemsList searchQuery={searchQuery} /> : <Navigate to="/login" />} />
              <Route path="/problems/:id" element={user ? <ProblemWorkspace /> : <Navigate to="/login" />} />
            </Routes>
          </main>
        </div>

        {/* Global Modals & Drawers */}
        <AiTutorDrawer isOpen={aiTutorOpen} onClose={() => setAiTutorOpen(false)} />
        <AchievementsModal isOpen={achievementsOpen} onClose={() => setAchievementsOpen(false)} />
        <BookmarksModal isOpen={bookmarksOpen} onClose={() => setBookmarksOpen(false)} />
      </div>
    </Router>
  );
}

export default App;
