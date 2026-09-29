import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, CheckCircle, Search, Filter, Edit3, RefreshCw, Save, X, Check, FileText } from 'lucide-react';
import NotesSection from './NotesSection';

export default function FacultyDashboard({ user, token }) {
  const [classList, setClassList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState('all'); // 'all' | 'flagged' | 'on_track'
  const [activeTab, setActiveTab] = useState('early_warning'); // 'early_warning' | 'notes'
  
  // Selected Student for Editing
  const [editingStudent, setEditingStudent] = useState(null);
  const [editSubjects, setEditSubjects] = useState([]);
  const [editAttendance, setEditAttendance] = useState(85);
  const [editCgpa, setEditCgpa] = useState(8.0);
  const [editLmsLogins, setEditLmsLogins] = useState(40);
  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  useEffect(() => {
    fetchClassData();
  }, [token]);

  const fetchClassData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/students/class-list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.students) {
        setClassList(data.students);
      }
    } catch (err) {
      console.error('Failed to fetch class list:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = (student) => {
    setEditingStudent(student);
    setEditSubjects(JSON.parse(JSON.stringify(student.subjects || [])));
    setEditAttendance(student.attendance || 85);
    setEditCgpa(student.cgpa || 8.0);
    setEditLmsLogins(student.lmsLogins || 40);
    setSaveSuccessMsg('');
  };

  const handleSubjectMarkChange = (index, field, value) => {
    const updated = [...editSubjects];
    updated[index][field] = value;
    setEditSubjects(updated);
  };

  const handleSaveStudentMarks = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccessMsg('');
    try {
      const res = await fetch('/api/students/update-student-marks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId: editingStudent.id,
          subjects: editSubjects,
          attendance: editAttendance,
          cgpa: editCgpa,
          lmsLogins: editLmsLogins
        })
      });

      const data = await res.json();
      setSaving(false);

      if (res.ok && data.student) {
        setSaveSuccessMsg('Student marks and risk status updated successfully!');
        fetchClassData(); // Refresh class list
        setTimeout(() => setEditingStudent(null), 1200);
      }
    } catch (err) {
      setSaving(false);
      console.error('Failed to update student marks:', err);
    }
  };

  const filteredStudents = classList.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (s.regNumber && s.regNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const hasFlagged = (s.subjects || []).some(sub => sub.flagged);
    const matchesRisk = filterRisk === 'all' ? true :
                        filterRisk === 'flagged' ? hasFlagged : !hasFlagged;

    return matchesSearch && matchesRisk;
  });

  const totalStudents = classList.length;
  const flaggedCount = classList.filter(s => (s.subjects || []).some(sub => sub.flagged)).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div className="card-glass" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            👨‍🏫 Faculty Portal & Course Management
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Instructor: <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{user.name}</span> | Scope: <span style={{ color: '#60a5fa', fontWeight: 700 }}>Faculty / HOD Staff Access</span>
          </p>
        </div>

        <button onClick={fetchClassData} className="btn-secondary">
          <RefreshCw style={{ width: '16px' }} /> Refresh Class Data
        </button>
      </div>

      {/* Faculty Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', pb: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('early_warning')}
          style={{
            padding: '0.75rem 1.25rem',
            background: activeTab === 'early_warning' ? 'rgba(37, 99, 235, 0.2)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'early_warning' ? '2px solid #3b82f6' : '2px solid transparent',
            color: activeTab === 'early_warning' ? '#60a5fa' : '#94a3b8',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Users style={{ width: '18px' }} /> Student Early Warning & Marks Editor
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
          <FileText style={{ width: '18px' }} /> Upload Study Notes & Resources
        </button>
      </div>

      {/* TAB 1: STUDENT EARLY WARNING & MARKS EDITOR */}
      {activeTab === 'early_warning' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Summary Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="card-glass">
              <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Total Enrolled Students</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.25rem' }}>{totalStudents}</div>
            </div>

            <div className="card-glass" style={{ borderLeft: '4px solid #ef4444' }}>
              <span style={{ fontSize: '0.875rem', color: '#f87171' }}>At-Risk Flagged Students</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ef4444', marginTop: '0.25rem' }}>{flaggedCount}</div>
            </div>

            <div className="card-glass" style={{ borderLeft: '4px solid #10b981' }}>
              <span style={{ fontSize: '0.875rem', color: '#34d399' }}>Students On Track</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>{totalStudents - flaggedCount}</div>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="card-glass" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', width: '18px' }} />
              <input
                type="text"
                placeholder="Search student by name or register number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.65rem 0.65rem 2.5rem', borderRadius: '0.5rem', background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter style={{ color: '#94a3b8', width: '18px' }} />
              <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Filter Risk:</span>
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                style={{ padding: '0.65rem', borderRadius: '0.5rem', background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff' }}
              >
                <option value="all">All Students ({totalStudents})</option>
                <option value="flagged">Needs Support ({flaggedCount})</option>
                <option value="on_track">On Track ({totalStudents - flaggedCount})</option>
              </select>
            </div>
          </div>

          {/* Student List Table */}
          <div className="card-glass">
            {loading ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>Loading class list...</p>
            ) : filteredStudents.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No student records found matching your filters.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Reg No</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Student Name</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Attendance</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Flagged Subjects</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Risk Status</th>
                      <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>Faculty Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((std) => {
                      const flaggedSubs = (std.subjects || []).filter(s => s.flagged);
                      const isAtRisk = flaggedSubs.length > 0;

                      return (
                        <tr key={std.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: '#94a3b8' }}>{std.regNumber}</td>
                          <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: '#f8fafc' }}>{std.name}</td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            <span style={{ color: std.attendance < 75 ? '#ef4444' : '#f8fafc', fontWeight: 600 }}>{std.attendance}%</span>
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            {flaggedSubs.length > 0 ? (
                              <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                {flaggedSubs.map((fs, i) => (
                                  <span key={i} style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontSize: '0.75rem', padding: '0.15rem 0.4rem', borderRadius: '0.25rem' }}>
                                    {fs.name} ({fs.internal1}/50)
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span style={{ color: '#64748b', fontSize: '0.8rem' }}>None</span>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            {isAtRisk ? (
                              <span className="badge-risk-high">At Risk</span>
                            ) : (
                              <span className="badge-risk-low">Good Standing</span>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                            <button 
                              onClick={() => handleOpenEditModal(std)}
                              className="btn-primary"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                            >
                              <Edit3 style={{ width: '14px' }} /> Edit Marks
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: STUDY NOTES MANAGER */}
      {activeTab === 'notes' && (
        <NotesSection user={user} token={token} />
      )}

      {/* Faculty Student Marks Edit Modal */}
      {editingStudent && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '650px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', pb: '0.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  ✏️ Edit Student Marks: {editingStudent.name}
                </h2>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Reg No: {editingStudent.regNumber} | Class: {editingStudent.className}</p>
              </div>
              <button onClick={() => setEditingStudent(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
            </div>

            {saveSuccessMsg && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Check style={{ width: '16px' }} /> {saveSuccessMsg}
              </div>
            )}

            <form onSubmit={handleSaveStudentMarks}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fbbf24', marginBottom: '0.75rem' }}>Subject Internal Exam Scores</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {editSubjects.map((sub, idx) => (
                  <div key={idx} style={{ background: '#0f172a', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '0.75rem', alignItems: 'center' }}>
                    <div>
                      <strong style={{ display: 'block', color: '#f8fafc', fontSize: '0.875rem' }}>{sub.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Code: {sub.code}</span>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.2rem' }}>Internal 1 (/50)</label>
                      <input
                        type="number"
                        value={sub.internal1 !== null && sub.internal1 !== undefined ? sub.internal1 : ''}
                        onChange={(e) => handleSubjectMarkChange(idx, 'internal1', e.target.value)}
                        min="0"
                        max="50"
                        placeholder="0-50"
                        style={{ width: '100%', padding: '0.4rem', borderRadius: '0.375rem', background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.2rem' }}>Internal 2 (/50)</label>
                      <input
                        type="number"
                        value={sub.internal2 !== null && sub.internal2 !== undefined ? sub.internal2 : ''}
                        onChange={(e) => handleSubjectMarkChange(idx, 'internal2', e.target.value)}
                        min="0"
                        max="50"
                        placeholder="Optional"
                        style={{ width: '100%', padding: '0.4rem', borderRadius: '0.375rem', background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff' }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Attendance & CGPA inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Attendance %</label>
                  <input
                    type="number"
                    value={editAttendance}
                    onChange={(e) => setEditAttendance(e.target.value)}
                    min="0"
                    max="100"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>CGPA (0 - 10)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editCgpa}
                    onChange={(e) => setEditCgpa(e.target.value)}
                    min="0"
                    max="10"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>LMS Logins</label>
                  <input
                    type="number"
                    value={editLmsLogins}
                    onChange={(e) => setEditLmsLogins(e.target.value)}
                    min="0"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setEditingStudent(null)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  <Save style={{ width: '16px' }} /> {saving ? 'Updating Marks...' : 'Save & Update Risk Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
