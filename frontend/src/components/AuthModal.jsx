import React, { useState } from 'react';
import { User, Lock, Mail, Key, ShieldCheck, GraduationCap, School, BookOpen } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [regNumber, setRegNumber] = useState('24BCA1504');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister ? {
      name,
      email,
      password,
      role,
      verificationCode,
      regNumber,
      department: 'Computer Science',
      className: '3rd Year BCA'
    } : { email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        setErrorMessage(data.message || 'Authentication failed');
        return;
      }

      localStorage.setItem('eduinsight_token', data.token);
      localStorage.setItem('eduinsight_user', JSON.stringify(data.user));
      onLoginSuccess(data.user, data.token);
      onClose();
    } catch (err) {
      setLoading(false);
      setErrorMessage('Failed to connect to backend server. Make sure node server is running.');
    }
  };

  const fillDemoUser = (userRole) => {
    if (userRole === 'student') {
      setEmail('abdul.shahanas@yenepoya.edu.in');
      setPassword('student123');
      setName('Abdul Shahanas P P');
      setRole('student');
    } else if (userRole === 'faculty') {
      setEmail('greeshma.poojary@yenepoya.edu.in');
      setPassword('faculty123');
      setName('Greeshma C Poojary');
      setRole('faculty');
      setVerificationCode('FACULTY2026');
    } else if (userRole === 'hod') {
      setEmail('rathnakar.shetty@yenepoya.edu.in');
      setPassword('hod123');
      setName('Dr. Rathnakar Shetty P');
      setRole('hod');
      setVerificationCode('HOD2026');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GraduationCap style={{ color: '#3b82f6' }} />
            {isRegister ? 'Create Account' : 'Welcome to EduInsight'}
          </h2>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.5rem' }}
          >
            &times;
          </button>
        </div>

        {errorMessage && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isRegister && (
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.25rem' }}>
                Account Role
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                {['student', 'faculty', 'hod'].map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRole(r)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '0.375rem',
                      border: '1fr solid',
                      borderColor: role === r ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)',
                      background: role === r ? 'rgba(59, 130, 246, 0.2)' : '#0f172a',
                      color: role === r ? '#60a5fa' : '#94a3b8',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isRegister && (
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.25rem' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', width: '18px' }} />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Abdul Shahanas P P"
                  required
                  style={{ width: '100%', padding: '0.65rem 0.65rem 0.65rem 2.5rem', borderRadius: '0.5rem', background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff' }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.25rem' }}>
              Institutional Email (@yenepoya.edu.in)
            </label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', width: '18px' }} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@yenepoya.edu.in"
                required
                style={{ width: '100%', padding: '0.65rem 0.65rem 0.65rem 2.5rem', borderRadius: '0.5rem', background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.25rem' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', width: '18px' }} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ width: '100%', padding: '0.65rem 0.65rem 0.65rem 2.5rem', borderRadius: '0.5rem', background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff' }}
              />
            </div>
          </div>

          {isRegister && (role === 'faculty' || role === 'hod') && (
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#fbbf24', marginBottom: '0.25rem' }}>
                Role Verification Code (Required for Staff)
              </label>
              <div style={{ position: 'relative' }}>
                <Key style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#fbbf24', width: '18px' }} />
                <input 
                  type="password" 
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder={role === 'faculty' ? 'FACULTY2026' : 'HOD2026'}
                  required
                  style={{ width: '100%', padding: '0.65rem 0.65rem 0.65rem 2.5rem', borderRadius: '0.5rem', background: '#0f172a', border: '1px solid #f59e0b', color: '#fff' }}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                Prevents students from registering as faculty. Demo codes: FACULTY2026 / HOD2026
              </p>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
            {loading ? 'Processing...' : isRegister ? 'Register & Continue' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
            {isRegister ? 'Already have an account?' : "Don't have an account yet?"}{' '}
            <button 
              onClick={() => setIsRegister(!isRegister)} 
              style={{ background: 'none', border: 'none', color: '#60a5fa', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
            >
              {isRegister ? 'Sign In' : 'Register Now'}
            </button>
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Quick Fill Demos:</span>
            <button type="button" onClick={() => fillDemoUser('student')} style={{ fontSize: '0.75rem', color: '#38bdf8', background: '#0f172a', border: '1px solid #0284c7', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer' }}>Student</button>
            <button type="button" onClick={() => fillDemoUser('faculty')} style={{ fontSize: '0.75rem', color: '#34d399', background: '#0f172a', border: '1px solid #059669', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer' }}>Faculty</button>
            <button type="button" onClick={() => fillDemoUser('hod')} style={{ fontSize: '0.75rem', color: '#fbbf24', background: '#0f172a', border: '1px solid #d97706', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer' }}>HOD</button>
          </div>
        </div>
      </div>
    </div>
  );
}
