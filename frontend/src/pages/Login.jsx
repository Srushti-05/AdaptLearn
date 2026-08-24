import React, { useState, useContext } from 'react';
import { AuthContext } from '../store/AuthContext';
import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import AdaptLearnLogo from '../components/AdaptLearnLogo';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
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
      <div className="card fade-in" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem 2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <AdaptLearnLogo size={48} />
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--brown-dark)', marginTop: '0.75rem', marginBottom: '0.2rem' }}>
            Welcome Back
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--brown-muted)' }}>
            Sign in to continue your adaptive learning path.
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', textAlign: 'center', fontSize: '0.84rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div>
            <label style={{ color: 'var(--brown-dark)', fontWeight: 600, fontSize: '0.84rem' }}>Email Address</label>
            <input 
              type="email" 
              className="input-control" 
              placeholder="e.g. ada@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ color: 'var(--brown-dark)', fontWeight: 600, fontSize: '0.84rem' }}>Password</label>
              <a href="#" style={{ fontSize: '0.75rem', color: 'var(--teal)' }}>Forgot?</a>
            </div>
            <input 
              type="password" 
              className="input-control" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn-teal" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', fontSize: '0.92rem' }}>
            <LogIn size={18} /> Sign In
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--brown-muted)', fontSize: '0.84rem' }}>
          Don't have an account? <Link to="/register" style={{ fontWeight: 700, color: 'var(--teal)' }}>Create account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
