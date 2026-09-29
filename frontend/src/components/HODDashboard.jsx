import React, { useState, useEffect } from 'react';
import { Building2, PieChart, Users, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

export default function HODDashboard({ user, token }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartmentSummary();
  }, [token]);

  const fetchDepartmentSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/students/department-summary', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      console.error('Failed to fetch department summary:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#94a3b8' }}>
        <RefreshCw style={{ animation: 'spin 1s linear infinite', width: '32px', height: '32px' }} />
        <p style={{ marginTop: '1rem' }}>Loading Department Analytics...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* HOD Top Banner */}
      <div className="card-glass" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🏛️ HOD Department Overview
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Head of Department: <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{user.name}</span> | Department: <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{summary?.department || 'Computer Science'}</span>
          </p>
        </div>

        <button onClick={fetchDepartmentSummary} className="btn-secondary">
          <RefreshCw style={{ width: '16px' }} /> Refresh Analytics
        </button>
      </div>

      {/* High-Level Stat Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="card-glass">
          <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Total Department Students</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.25rem' }}>{summary?.totalStudents || 0}</div>
        </div>

        <div className="card-glass" style={{ borderLeft: '4px solid #ef4444' }}>
          <span style={{ fontSize: '0.875rem', color: '#f87171' }}>Department Flagged Students</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ef4444', marginTop: '0.25rem' }}>
            {summary?.flaggedStudentsCount || 0} ({summary?.overallRiskPercentage}% Risk Rate)
          </div>
        </div>

        <div className="card-glass" style={{ borderLeft: '4px solid #38bdf8' }}>
          <span style={{ fontSize: '0.875rem', color: '#38bdf8' }}>Average Attendance %</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.25rem' }}>{summary?.averageAttendance}%</div>
        </div>
      </div>

      {/* Risk Distribution Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Subject Risk Distribution */}
        <div className="card-glass">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieChart style={{ color: '#f59e0b' }} /> Subject Risk Breakdown
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Object.entries(summary?.subjectRiskDistribution || {}).length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No high-risk subjects flagged in current period.</p>
            ) : (
              Object.entries(summary?.subjectRiskDistribution || {}).map(([subject, count], i) => (
                <div key={i} style={{ background: '#0f172a', padding: '0.75rem 1rem', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{subject}</span>
                  <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '0.375rem', fontSize: '0.875rem' }}>
                    {count} Students Flagged
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Faculty Supervision List */}
        <div className="card-glass">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users style={{ color: '#34d399' }} /> Faculty Supervision & Class Risk
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(summary?.facultyList || []).map((fac, i) => (
              <div key={i} style={{ background: '#0f172a', padding: '0.85rem', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ display: 'block', color: '#f8fafc', fontSize: '0.95rem' }}>{fac.name}</strong>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{fac.subject} • {fac.class}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Needs Support</span>
                  <strong style={{ color: fac.flaggedCount > 0 ? '#ef4444' : '#10b981' }}>{fac.flaggedCount} Students</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
