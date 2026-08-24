import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../store/AuthContext';
import { 
  BarChart, Bar, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  CheckCircle2, 
  Clock, 
  Target, 
  Zap, 
  TrendingUp, 
  BrainCircuit, 
  AlertCircle, 
  ArrowRight,
  Flame,
  Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recommendation, setRecommendation] = useState(null);

  useEffect(() => {
    fetchDashboard();
    fetchRecommendation();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get('/adaptive/dashboard');
      setStats(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRecommendation = async () => {
    try {
      const res = await axios.get('/adaptive/recommendation');
      setRecommendation(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const weeklyData = [
    { name: 'Mon', attempted: 4, solved: 3 },
    { name: 'Tue', attempted: 6, solved: 5 },
    { name: 'Wed', attempted: 3, solved: 3 },
    { name: 'Thu', attempted: 8, solved: 6 },
    { name: 'Fri', attempted: 5, solved: 4 },
    { name: 'Sat', attempted: 7, solved: 7 },
    { name: 'Sun', attempted: 2, solved: 2 },
  ];

  const radarData = [
    { subject: 'Dynamic Prog.', A: 85 },
    { subject: 'Trees & Graphs', A: 65 },
    { subject: 'Arrays & Maps', A: 95 },
    { subject: 'Two Pointers', A: 80 },
    { subject: 'Strings', A: 90 },
  ];

  const difficultyData = [
    { name: 'Easy', value: stats?.problemsSolvedCount || 4, color: '#178C8E' },
    { name: 'Medium', value: 2, color: '#D97706' },
    { name: 'Hard', value: 1, color: '#3D2921' },
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Banner with Adaptive Insight */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-card)',
        padding: '1.5rem 1.75rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: 'var(--shadow-card)',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF7F2 100%)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span className="badge-new">AI ENGINE ACTIVE</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--brown-muted)' }}>Real-time telemetry tracking</span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--brown-dark)', margin: 0 }}>
            Welcome back, {user?.name || 'Srushti'}!
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--brown-muted)', marginTop: '0.25rem' }}>
            Your learning trajectory is currently <strong style={{ color: 'var(--teal)' }}>18% ahead</strong> of standard pacing.
          </p>
        </div>

        {recommendation && (
          <div style={{
            backgroundColor: 'var(--teal-soft)',
            border: '1px solid var(--teal-border)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase' }}>Recommended Next</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--brown-dark)' }}>{recommendation.title}</div>
            </div>
            <button 
              className="btn-continue" 
              style={{ padding: '0.45rem 1.1rem', fontSize: '0.82rem' }}
              onClick={() => navigate(`/problems/${recommendation._id}`)}
            >
              Solve <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* 4 Summary Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--brown-muted)' }}>Challenges Solved</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--teal-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal)' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brown-dark)' }}>
            {stats?.problemsSolvedCount || 1} <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--brown-muted)' }}>/ 7 total</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--teal)', fontWeight: 600, marginTop: '0.25rem' }}>
            +2 this week
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--brown-muted)' }}>Accuracy Rate</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--beige-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--beige-text)' }}>
              <Target size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brown-dark)' }}>
            {stats?.accuracy || 85}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--brown-muted)', marginTop: '0.25rem' }}>
            Across {stats?.totalSubmissions || 2} submissions
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--brown-muted)' }}>Current Streak</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--orange-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--orange-streak)' }}>
              <Flame size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brown-dark)' }}>
            7 <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--brown-muted)' }}>Days</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--orange-streak)', fontWeight: 600, marginTop: '0.25rem' }}>
            Personal best! 🔥
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--brown-muted)' }}>Time Practiced</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--teal-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal)' }}>
              <Clock size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brown-dark)' }}>
            8h 24m
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--brown-muted)', marginTop: '0.25rem' }}>
            Avg 42m / session
          </div>
        </div>

      </div>

      {/* Analytics Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
        
        {/* Weekly Activity Bar Chart */}
        <div className="card" style={{ gridColumn: 'span 8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--brown-dark)', margin: 0 }}>Weekly Activity</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--brown-muted)' }}>Submissions vs test case passes</span>
            </div>
            <div style={{ display: 'flex', gap: '0.85rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--teal)' }}></div>
                <span>Solved</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F6EEDA' }}></div>
                <span>Attempted</span>
              </div>
            </div>
          </div>
          
          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFEAE4" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#8C827A', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#8C827A', fontSize: 12}} />
                <Tooltip cursor={{fill: 'rgba(23, 140, 142, 0.04)'}} contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #EFEAE4', boxShadow: 'var(--shadow-card)' }} />
                <Bar dataKey="attempted" fill="#F6EEDA" radius={[4, 4, 0, 0]} name="Attempted" barSize={16} />
                <Bar dataKey="solved" fill="#178C8E" radius={[4, 4, 0, 0]} name="Solved" barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Mastery Chart */}
        <div className="card" style={{ gridColumn: 'span 4' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--brown-dark)', marginBottom: '0.35rem' }}>Topic Mastery</h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--brown-muted)' }}>Calculated algorithm proficiency</span>
          
          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="68%" data={radarData}>
                <PolarGrid stroke="#EFEAE4" />
                <PolarAngleAxis dataKey="subject" tick={{fill: '#8C827A', fontSize: 10}} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Mastery" dataKey="A" stroke="#178C8E" fill="#178C8E" fillOpacity={0.25} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weak Topics Card */}
        <div className="card" style={{ gridColumn: 'span 6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <AlertCircle size={18} color="var(--orange-streak)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--brown-dark)', margin: 0 }}>Targeted Focus Areas</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--brown-muted)', marginBottom: '1rem' }}>
            Topics identified from recent runtime errors or suboptimal complexity to reinforce:
          </p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {stats?.weak_topics && stats.weak_topics.length > 0 ? (
              stats.weak_topics.map(t => (
                <span key={t} className="tag-pill tag-beige" style={{ fontSize: '0.8rem', padding: '0.35rem 0.8rem' }}>
                  🎯 {t}
                </span>
              ))
            ) : (
              ['dynamic programming', 'two pointers', 'sliding window'].map(t => (
                <span key={t} className="tag-pill tag-beige" style={{ fontSize: '0.8rem', padding: '0.35rem 0.8rem' }}>
                  🎯 {t}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Learning Path Quick CTA */}
        <div className="card" style={{ gridColumn: 'span 6', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(135deg, var(--teal-soft) 0%, #FFFFFF 100%)' }}>
          <div>
            <span className="badge-new" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>NEXT MILESTONE</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brown-dark)', margin: 0 }}>Data Structures Crash Course</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--brown-muted)', marginTop: '0.35rem' }}>
              40% completed • 8 Challenges available covering Arrays, Hash Maps & Strings.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button className="btn-teal" onClick={() => navigate('/')}>
              Continue Learning Path <ArrowRight size={16} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
