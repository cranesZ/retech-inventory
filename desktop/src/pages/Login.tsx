import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignup) {
        await register({ email, password, name });
      } else {
        await login({ email, password });
      }
      navigate('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}>
        <h1 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          {isSignup ? 'Create Account' : 'Sign In'}
        </h1>

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={isSignup}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: '0.75rem',
              marginBottom: '1rem',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              borderRadius: '4px',
              fontSize: '0.875rem',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="primary"
            style={{
              width: '100%',
              padding: '0.75rem',
              marginBottom: '1rem',
            }}
          >
            {isLoading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Sign In'}
          </button>

          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setError(null);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {isSignup ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
