import React, { useState, useContext } from 'react';
import { AuthContext } from '../store/AuthContext';
import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import AdaptLearnLogo from '../components/AdaptLearnLogo';

const Register = () => {
  const { register } = useContext(AuthContext);
  const [formData, setFormData] = useState({ name: 'Srushti Gujar', email: '', password: '', skill_level: 'beginner' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData.name, formData.email, formData.password, formData.skill_level);
    } catch (err) {
      setError(err.response?.data?.error || 'Error registering');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      zIndex: 10
    }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem 2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <AdaptLearnLogo size={48} />
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--brown-dark)', marginTop: '0.75rem', marginBottom: '0.2rem' }}>
            Create Account
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--brown-muted)' }}>
            Join AdaptLearn to accelerate your algorithm mastery.
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', textAlign: 'center', fontSize: '0.84rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div>
            <label style={{ color: 'var(--brown-dark)', fontWeight: 600, fontSize: '0.84rem' }}>Full Name</label>
            <input 
              type="text" 
              className="input-control" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required 
            />
          </div>

          <div>
            <label style={{ color: 'var(--brown-dark)', fontWeight: 600, fontSize: '0.84rem' }}>Email Address</label>
            <input 
              type="email" 
              className="input-control" 
              placeholder="e.g. srushti@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required 
            />
          </div>

          <div>
            <label style={{ color: 'var(--brown-dark)', fontWeight: 600, fontSize: '0.84rem' }}>Password</label>
            <input 
              type="password" 
              className="input-control" 
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required 
            />
          </div>

          <div>
            <label style={{ color: 'var(--brown-dark)', fontWeight: 600, fontSize: '0.84rem' }}>Starting Skill Level</label>
            <select 
              className="input-control"
              value={formData.skill_level}
              onChange={(e) => setFormData({...formData, skill_level: e.target.value})}
              style={{ backgroundColor: '#FFFFFF' }}
            >
              <option value="beginner">Beginner (Foundations & Basics)</option>
              <option value="intermediate">Intermediate (Data Structures)</option>
              <option value="advanced">Advanced (Complex Algorithms)</option>
            </select>
          </div>

          <button type="submit" className="btn-teal" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', fontSize: '0.92rem' }}>
            <UserPlus size={18} /> Start Learning
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--brown-muted)', fontSize: '0.84rem' }}>
          Already have an account? <Link to="/login" style={{ fontWeight: 700, color: 'var(--teal)' }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
