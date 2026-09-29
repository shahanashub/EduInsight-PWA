import React, { useState, useEffect } from 'react';
import { Settings, Save, ShieldCheck, Key, RefreshCw } from 'lucide-react';

export default function AdminDashboard({ token }) {
  const [settings, setSettings] = useState({
    institutionDomain: 'yenepoya.edu.in',
    facultyCode: 'FACULTY2026',
    hodCode: 'HOD2026',
    passThresholdPercent: 50
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, [token]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/analytics/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
        setMessage('Institutional settings saved successfully!');
      }
    } catch (err) {
      setMessage('Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '700px', margin: '0 auto' }}>
      <div className="card-glass">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings style={{ color: '#38bdf8' }} /> Institutional System Configuration
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
          Manage security parameters, verification codes, and passing thresholds for EduInsight.
        </p>

        {message && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '0.75rem', borderRadius: '0.5rem', marginTop: '1rem', fontSize: '0.875rem' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.35rem' }}>
              Required Institutional Email Domain
            </label>
            <input
              type="text"
              value={settings.institutionDomain}
              onChange={(e) => setSettings({ ...settings, institutionDomain: e.target.value })}
              placeholder="yenepoya.edu.in"
              required
              style={{ width: '100%', padding: '0.65rem', borderRadius: '0.5rem', background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.35rem' }}>
              Faculty Registration Verification Code
            </label>
            <input
              type="text"
              value={settings.facultyCode}
              onChange={(e) => setSettings({ ...settings, facultyCode: e.target.value })}
              placeholder="FACULTY2026"
              required
              style={{ width: '100%', padding: '0.65rem', borderRadius: '0.5rem', background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.35rem' }}>
              HOD Registration Verification Code
            </label>
            <input
              type="text"
              value={settings.hodCode}
              onChange={(e) => setSettings({ ...settings, hodCode: e.target.value })}
              placeholder="HOD2026"
              required
              style={{ width: '100%', padding: '0.65rem', borderRadius: '0.5rem', background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.35rem' }}>
              Subject At-Risk Flagging Threshold (%)
            </label>
            <input
              type="number"
              value={settings.passThresholdPercent}
              onChange={(e) => setSettings({ ...settings, passThresholdPercent: parseFloat(e.target.value) })}
              min="1"
              max="100"
              required
              style={{ width: '100%', padding: '0.65rem', borderRadius: '0.5rem', background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff' }}
            />
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
              Subjects scoring below this percentage in Internal 1 or 2 will trigger a flagged status and generate a study plan.
            </p>
          </div>

          <button type="submit" disabled={saving} className="btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
            <Save style={{ width: '16px' }} /> {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </form>
      </div>
    </div>
  );
}
