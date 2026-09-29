import React, { useState, useEffect } from 'react';
import { BookOpen, AlertTriangle, CheckCircle, Clock, Target, Award, Briefcase, Sparkles, RefreshCw, Lock, ShieldAlert, FileText } from 'lucide-react';
import NotesSection from './NotesSection';

export default function StudentDashboard({ user, token }) {
  const [student, setStudent] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('academic'); // 'academic' | 'study_plan' | 'career' | 'notes'

  useEffect(() => {
    fetchStudentProfile();
  }, [token]);

  const fetchStudentProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/students/my-profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.student) {
        setStudent(data.student);
        fetchRecommendations();
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const res = await fetch('/api/analytics/recommendations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setRecommendations(data);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#94a3b8' }}>
        <RefreshCw style={{ animation: 'spin 1s linear infinite', width: '32px', height: '32px' }} />
        <p style={{ marginTop: '1rem' }}>Loading Student Performance & Analytics...</p>
      </div>
    );
  }

  const subjects = student?.subjects || [];
  const flaggedCount = subjects.filter(s => s.flagged).length;
  const overallRisk = recommendations?.overallRisk || { risk_level: 'low', confidence_score: 0.85 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Student Header Card */}
      <div className="card-glass" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>
              🎓 {student?.name || user.name}
            </h1>
            <span style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '0.25rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <Lock style={{ width: '12px' }} /> Student Read-Only View
            </span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Reg No: <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{student?.regNumber || '24BCA1504'}</span> | Program: <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{student?.className}</span>
          </p>
        </div>

        {/* Risk Status pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ML Risk Level</span>
            <span className={`badge-risk-${overallRisk.risk_level}`} style={{ fontSize: '0.875rem', padding: '0.35rem 0.85rem' }}>
              {overallRisk.risk_level} Risk ({Math.round((overallRisk.confidence_score || 0.85) * 100)}% Conf)
            </span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Flagged Subjects</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: flaggedCount > 0 ? '#ef4444' : '#10b981' }}>
              {flaggedCount} {flaggedCount === 1 ? 'Subject' : 'Subjects'}
            </span>
          </div>
        </div>
      </div>

      {/* Access Permission Info Banner */}
      <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '0.75rem', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#93c5fd', fontSize: '0.875rem' }}>
        <ShieldAlert style={{ width: '20px', height: '20px', flexShrink: 0, color: '#60a5fa' }} />
        <span>Students have <strong>read-only access</strong> to view internal performance metrics, study plans, career guidance, and download lecture notes. Assessment marks are managed by Faculty.</span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', pb: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('academic')}
          style={{
            padding: '0.75rem 1.25rem',
            background: activeTab === 'academic' ? 'rgba(37, 99, 235, 0.2)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'academic' ? '2px solid #3b82f6' : '2px solid transparent',
            color: activeTab === 'academic' ? '#60a5fa' : '#94a3b8',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <BookOpen style={{ width: '18px' }} /> Internal Marks & Attendance
        </button>

        <button
          onClick={() => setActiveTab('study_plan')}
          style={{
            padding: '0.75rem 1.25rem',
            background: activeTab === 'study_plan' ? 'rgba(37, 99, 235, 0.2)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'study_plan' ? '2px solid #3b82f6' : '2px solid transparent',
            color: activeTab === 'study_plan' ? '#60a5fa' : '#94a3b8',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Target style={{ width: '18px' }} /> Quantified Study Plans ({recommendations?.studyPlans?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          style={{
            padding: '0.75rem 1.25rem',
            background: activeTab === 'notes' ? 'rgba(37, 99, 235, 0.2)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'notes' ? '2px solid #3b82f6' : '2px solid transparent',
            color: activeTab === 'notes' ? '#60a5fa' : '#94a3b8',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FileText style={{ width: '18px' }} /> Study Notes & Resources
        </button>

        <button
          onClick={() => setActiveTab('career')}
          style={{
            padding: '0.75rem 1.25rem',
            background: activeTab === 'career' ? 'rgba(37, 99, 235, 0.2)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'career' ? '2px solid #3b82f6' : '2px solid transparent',
            color: activeTab === 'career' ? '#60a5fa' : '#94a3b8',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Briefcase style={{ width: '18px' }} /> Skill & Career Recommendations
        </button>
      </div>

      {/* TAB 1: ACADEMIC MARKS VIEW (READ ONLY) */}
      {activeTab === 'academic' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card-glass">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f8fafc' }}>Recorded Subject Internal Marks</h2>
              <button onClick={fetchStudentProfile} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                <RefreshCw style={{ width: '14px' }} /> Refresh
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Code</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Subject Name</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Internal 1</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Internal 2</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Academic Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((sub, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: '#94a3b8' }}>{sub.code}</td>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: '#f8fafc' }}>{sub.name}</td>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: sub.internal1 < 25 ? '#ef4444' : '#f8fafc' }}>
                        {sub.internal1 !== null && sub.internal1 !== undefined ? `${sub.internal1} / ${sub.maxMarks || 50}` : 'N/A'}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: sub.internal2 && sub.internal2 < 25 ? '#ef4444' : '#f8fafc' }}>
                        {sub.internal2 !== null && sub.internal2 !== undefined ? `${sub.internal2} / ${sub.maxMarks || 50}` : 'Pending'}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        {sub.flagged ? (
                          <span className="badge-risk-high" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <AlertTriangle style={{ width: '12px' }} /> Needs Improvement
                          </span>
                        ) : (
                          <span className="badge-risk-low" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <CheckCircle style={{ width: '12px' }} /> On Track
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Attendance, CGPA, LMS Readonly Display Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="card-glass">
              <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Overall Attendance</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: (student?.attendance || 85) < 75 ? '#ef4444' : '#38bdf8', marginTop: '0.25rem' }}>
                {student?.attendance || 85}%
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Institutional Min Threshold: 75%</p>
            </div>

            <div className="card-glass">
              <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Cumulative CGPA</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.25rem' }}>
                {student?.cgpa || 8.2} / 10.0
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Based on verified transcript</p>
            </div>

            <div className="card-glass">
              <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>LMS Logins & Activity</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399', marginTop: '0.25rem' }}>
                {student?.lmsLogins || 42} Sessions
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Active course engagement</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QUANTIFIED STUDY PLANS */}
      {activeTab === 'study_plan' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {(!recommendations?.studyPlans || recommendations.studyPlans.length === 0) ? (
            <div className="card-glass" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <CheckCircle style={{ width: '48px', height: '48px', color: '#10b981', margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Great job! No subjects flagged.</h3>
              <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>All your internal scores are above the threshold. Keep up the good performance!</p>
            </div>
          ) : (
            recommendations.studyPlans.map((plan, idx) => (
              <div key={idx} className="card-glass" style={{ borderLeft: '4px solid #f59e0b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', pb: '1rem', mb: '1rem' }}>
                  <div>
                    <span className="badge-risk-high" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>Flagged Subject</span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>{plan.subjectName} ({plan.subjectCode})</h3>
                    <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                      Current Internal Score: <span style={{ color: '#ef4444', fontWeight: 700 }}>{plan.currentScore} / {plan.maxMarks}</span> (Score gap: {plan.scoreGap} marks)
                    </p>
                  </div>

                  <div style={{ background: 'rgba(37, 99, 235, 0.15)', border: '1px solid rgba(37, 99, 235, 0.3)', padding: '0.75rem 1.25rem', borderRadius: '0.75rem', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#60a5fa', textTransform: 'uppercase', display: 'block' }}>Projected Target Score</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>{plan.projectedScore} / {plan.maxMarks}</span>
                  </div>
                </div>

                {/* Quantified Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Clock style={{ color: '#60a5fa', width: '24px' }} />
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Daily Study Hours</span>
                      <strong style={{ fontSize: '1.125rem', color: '#f8fafc' }}>{plan.recommendedDailyHours} Hours / day</strong>
                    </div>
                  </div>

                  <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Target style={{ color: '#34d399', width: '24px' }} />
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Suggested Duration</span>
                      <strong style={{ fontSize: '1.125rem', color: '#f8fafc' }}>{plan.suggestedDurationDays} Days ({plan.totalPlanHours} hrs total)</strong>
                    </div>
                  </div>
                </div>

                {/* Focus Topics */}
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fbbf24', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Sparkles style={{ width: '16px' }} /> Recommended Priority Focus Topics
                  </h4>
                  <ul style={{ listStyleType: 'disc', paddingLeft: '1.25rem', color: '#cbd5e1', fontSize: '0.875rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.35rem' }}>
                    {plan.focusTopics.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: STUDY NOTES & RESOURCES */}
      {activeTab === 'notes' && (
        <NotesSection user={user} token={token} />
      )}

      {/* TAB 4: CAREER & COURSE RECOMMENDATIONS */}
      {activeTab === 'career' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Recommended Courses */}
          <div className="card-glass">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award style={{ color: '#38bdf8' }} /> Recommended Skill Courses
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(recommendations?.courseSuggestions || []).map((course, idx) => (
                <div key={idx} style={{ background: '#0f172a', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <h4 style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1rem' }}>{course.title}</h4>
                  <p style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '0.25rem' }}>{course.platform} • {course.duration}</p>
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.5rem' }}>{course.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Job Roles */}
          <div className="card-glass">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Briefcase style={{ color: '#34d399' }} /> Target Career & Job Roles
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(recommendations?.jobRoleSuggestions || []).map((role, idx) => (
                <div key={idx} style={{ background: '#0f172a', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1rem' }}>{role.title}</h4>
                    <span style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem 0.5rem', borderRadius: '0.375rem' }}>
                      {role.matchPercentage}% Match
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>{role.avgSalaryRange}</p>

                  <div style={{ marginTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 600 }}>Required Skills:</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                      {role.requiredSkills.map((sk, i) => (
                        <span key={i} style={{ background: '#1e293b', color: '#60a5fa', fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: '0.25rem' }}>{sk}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
