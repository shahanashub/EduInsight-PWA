import React, { useState, useEffect } from 'react';
import { Download, LogIn, LogOut, Shield, User, GraduationCap, LayoutDashboard, Settings, WifiOff } from 'lucide-react';
import AuthModal from './components/AuthModal';
import StudentDashboard from './components/StudentDashboard';
import FacultyDashboard from './components/FacultyDashboard';
import HODDashboard from './components/HODDashboard';
import AdminDashboard from './components/AdminDashboard';
import { setupPWA } from './registerSW';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    // 1. Check existing session in localStorage
    const savedToken = localStorage.getItem('eduinsight_token');
    const savedUser = localStorage.getItem('eduinsight_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }

    // 2. Listen for PWA Install Prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    // 3. Listen for Network Offline/Online status
    window.addEventListener('online', () => setIsOffline(false));
    window.addEventListener('offline', () => setIsOffline(true));

    // Register service worker
    setupPWA();
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('eduinsight_token');
    localStorage.removeItem('eduinsight_user');
    setUser(null);
    setToken('');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <header style={{ background: '#1e293b', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', sticky: 'top' }}>
        <div className="container-custom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', padding: '0.5rem', borderRadius: '0.5rem', display: 'flex' }}>
              <GraduationCap style={{ color: '#fff', width: '24px', height: '24px' }} />
            </div>
            <div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>EduInsight</span>
              <span style={{ fontSize: '0.65rem', background: 'rgba(37, 99, 235, 0.2)', color: '#60a5fa', padding: '0.1rem 0.4rem', borderRadius: '0.25rem', marginLeft: '0.5rem', textTransform: 'uppercase', fontWeight: 700 }}>PWA App</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* PWA Install Button */}
            {deferredPrompt && !isInstalled && (
              <button onClick={handleInstallPWA} className="btn-primary" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', fontSize: '0.85rem', padding: '0.45rem 0.85rem' }}>
                <Download style={{ width: '16px' }} /> Install App
              </button>
            )}

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ textAlign: 'right', display: 'none', sm: 'block' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc', display: 'block' }}>{user.name}</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'capitalize' }}>{user.role} View</span>
                </div>

                <button onClick={handleLogout} className="btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}>
                  <LogOut style={{ width: '16px' }} /> Sign Out
                </button>
              </div>
            ) : (
              <button onClick={() => setIsAuthOpen(true)} className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem' }}>
                <LogIn style={{ width: '16px' }} /> Sign In / Register
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Offline Status Banner */}
      {isOffline && (
        <div style={{ background: '#f59e0b', color: '#0f172a', fontWeight: 700, fontSize: '0.85rem', textAlign: 'center', padding: '0.35rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <WifiOff style={{ width: '16px' }} /> You are working offline. Cached EduInsight metrics & study plans are active.
        </div>
      )}

      {/* Main Content Area */}
      <main className="container-custom" style={{ flex: 1, padding: '2rem 1.5rem' }}>
        {!user ? (
          <div className="card-glass" style={{ textAlign: 'center', padding: '4rem 1.5rem', maxWidth: '750px', margin: '2rem auto' }}>
            <div style={{ width: '64px', height: '64px', background: 'rgba(37, 99, 235, 0.15)', color: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <GraduationCap style={{ width: '36px', height: '36px' }} />
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.75rem', lineHeight: '1.2' }}>
              Predictive Analytics Platform for Student Performance & Skill Development
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
              EduInsight connects Internal assessment marks with machine learning risk classification, personalized quantified study plans, and career readiness recommendations.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button onClick={() => setIsAuthOpen(true)} className="btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}>
                Get Started / Sign In
              </button>
            </div>
          </div>
        ) : (
          <>
            {user.role === 'student' && <StudentDashboard user={user} token={token} />}
            {user.role === 'faculty' && <FacultyDashboard user={user} token={token} />}
            {user.role === 'hod' && <HODDashboard user={user} token={token} />}
            {user.role === 'admin' && <AdminDashboard token={token} />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{ background: '#0f172a', borderTop: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'center', padding: '1.5rem 1rem', color: '#64748b', fontSize: '0.85rem' }}>
        <p>EduInsight Progressive Web Application • Yenepoya Institute of Arts, Science, Commerce & Management</p>
      </footer>

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(loggedInUser, authToken) => {
          setUser(loggedInUser);
          setToken(authToken);
        }} 
      />
    </div>
  );
}
