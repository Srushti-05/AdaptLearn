import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../store/AuthContext';
import { 
  BarChart, Bar, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
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
  Award,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [dashRes, recRes] = await Promise.all([
          axios.get('/adaptive/dashboard'),
          axios.get('/adaptive/recommendation')
        ]);
        setStats(dashRes.data.data);
        setRecommendation(recRes.data.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const weeklyData = stats?.weeklyActivity && stats.weeklyActivity.length > 0
    ? stats.weeklyActivity
    : [
        { name: 'Mon', attempted: 0, solved: 0 },
        { name: 'Tue', attempted: 0, solved: 0 },
        { name: 'Wed', attempted: 0, solved: 0 },
        { name: 'Thu', attempted: 0, solved: 0 },
        { name: 'Fri', attempted: 0, solved: 0 },
        { name: 'Sat', attempted: 0, solved: 0 },
        { name: 'Sun', attempted: 0, solved: 0 },
      ];

  const radarData = stats?.radarData && stats.radarData.length > 0
    ? stats.radarData
    : [
        { subject: 'Arrays', A: 30 },
        { subject: 'Strings', A: 30 },
        { subject: 'Two Pointers', A: 30 },
        { subject: 'Hash Map', A: 30 },
        { subject: 'Dynamic Prog.', A: 30 },
        { subject: 'Binary Search', A: 30 },
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
            <span className="badge-new">BKT & ELO ENGINE ACTIVE</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--brown-muted)' }}>Latent knowledge state tracking live</span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--brown-dark)', margin: 0 }}>
            Welcome back, {user?.name || 'Learner'}!
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--brown-muted)', marginTop: '0.25rem' }}>
            Bayesian Knowledge Tracing is dynamically tailoring problem recommendations to your Zone of Proximal Development.
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
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase' }}>ZPD Recommended Next</div>
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
            {stats?.problemsSolvedCount || 0} <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--brown-muted)' }}>/ {stats?.totalProblemsInPlatform || 7} total</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--teal)', fontWeight: 600, marginTop: '0.25rem' }}>
            Verified in sandbox
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
            {stats?.accuracy || 0}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--brown-muted)', marginTop: '0.25rem' }}>
            Across {stats?.totalSubmissions || 0} evaluated attempts
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--brown-muted)' }}>Consecutive Streak</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--orange-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--orange-streak)' }}>
              <Flame size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brown-dark)' }}>
            {stats?.streak || 0} <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--brown-muted)' }}>Days</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--orange-streak)', fontWeight: 600, marginTop: '0.25rem' }}>
            {stats?.streak > 0 ? 'Daily momentum active! 🔥' : 'Start your streak today!'}
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--brown-muted)' }}>Submissions Logged</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--teal-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal)' }}>
              <Clock size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brown-dark)' }}>
            {stats?.totalSubmissions || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--brown-muted)', marginTop: '0.25rem' }}>
            Telemetry profile synced
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
              <span style={{ fontSize: '0.78rem', color: 'var(--brown-muted)' }}>Actual submissions vs passes from database</span>
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
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--brown-dark)', marginBottom: '0.35rem' }}>BKT Mastery Probability</h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--brown-muted)' }}>Bayesian knowledge estimation (0-100%)</span>
          
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
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--brown-dark)', margin: 0 }}>Targeted Remediation Focus Areas</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--brown-muted)', marginBottom: '1rem' }}>
            Topics where Bayesian probability of mastery is currently below 65%:
          </p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {stats?.weak_topics && stats.weak_topics.length > 0 ? (
              stats.weak_topics.map(t => (
                <span key={t} className="tag-pill tag-beige" style={{ fontSize: '0.8rem', padding: '0.35rem 0.8rem' }}>
                  🎯 {t}
                </span>
              ))
            ) : (
              <span style={{ fontSize: '0.82rem', color: 'var(--teal)', fontWeight: 600 }}>
                ✨ No weak topics detected! High competency across all attempted areas.
              </span>
            )}
          </div>
        </div>

        {/* Learning Path Quick CTA */}
        <div className="card" style={{ gridColumn: 'span 6', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(135deg, var(--teal-soft) 0%, #FFFFFF 100%)' }}>
          <div>
            <span className="badge-new" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>CURRICULUM</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brown-dark)', margin: 0 }}>Dynamic Prerequisite Learning Path</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--brown-muted)', marginTop: '0.35rem' }}>
              Progress through DAG-governed modules. Higher tier modules unlock automatically once foundational competencies are proven.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button className="btn-teal" onClick={() => navigate('/learning-path')}>
              Explore Learning Path <ArrowRight size={16} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
