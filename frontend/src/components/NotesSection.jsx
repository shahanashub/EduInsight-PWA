import React, { useState, useEffect } from 'react';
import { FileText, Download, Upload, Trash2, Plus, RefreshCw, FileCode, Presentation, FileSpreadsheet, CheckCircle, ShieldAlert } from 'lucide-react';

export default function NotesSection({ user, token }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload Form State (Faculty Only)
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subjectCode, setSubjectCode] = useState('CS501');
  const [subjectName, setSubjectName] = useState('Software Engineering & PWA');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isStaff = user && (user.role === 'faculty' || user.role === 'hod' || user.role === 'admin');

  useEffect(() => {
    fetchNotes();
  }, [token]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.notes) {
        setNotes(data.notes);
      }
    } catch (err) {
      console.error('Failed to fetch study notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (filename, originalName) => {
    try {
      const res = await fetch(`/api/notes/download/${filename}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = originalName || filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setSuccessMsg('');
    setErrorMsg('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('subjectCode', subjectCode);
    formData.append('subjectName', subjectName);
    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    try {
      const res = await fetch('/api/notes/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      setUploading(false);

      if (!res.ok) {
        setErrorMsg(data.message || 'Upload failed');
        return;
      }

      setSuccessMsg('Study note uploaded successfully!');
      setTitle('');
      setSelectedFile(null);
      fetchNotes();
      setTimeout(() => setIsUploadOpen(false), 1200);
    } catch (err) {
      setUploading(false);
      setErrorMsg('Failed to upload study note.');
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this study note?')) return;
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchNotes();
      }
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType?.toLowerCase()) {
      case 'ppt': return <Presentation style={{ color: '#f59e0b', width: '24px', height: '24px' }} />;
      case 'xls': return <FileSpreadsheet style={{ color: '#10b981', width: '24px', height: '24px' }} />;
      case 'pdf': return <FileText style={{ color: '#ef4444', width: '24px', height: '24px' }} />;
      default: return <FileCode style={{ color: '#38bdf8', width: '24px', height: '24px' }} />;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '1.2 MB';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div className="card-glass" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📚 Course Study Notes & Resources
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {isStaff ? 'Upload, reupload, or manage study slides & reference documents (PDF, PPT, XLS).' : 'Download official course slides, lecture notes, and reference files uploaded by Faculty.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchNotes} className="btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}>
            <RefreshCw style={{ width: '16px' }} /> Refresh
          </button>
          {isStaff && (
            <button onClick={() => setIsUploadOpen(true)} className="btn-primary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}>
              <Plus style={{ width: '16px' }} /> Upload New Note
            </button>
          )}
        </div>
      </div>

      {/* Access Permission Banner */}
      <div style={{ background: isStaff ? 'rgba(52, 211, 153, 0.1)' : 'rgba(59, 130, 246, 0.1)', border: isStaff ? '1px solid rgba(52, 211, 153, 0.25)' : '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '0.75rem', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: isStaff ? '#6ee7b7' : '#93c5fd', fontSize: '0.875rem' }}>
        <ShieldAlert style={{ width: '20px', height: '20px', flexShrink: 0 }} />
        <span>
          {isStaff 
            ? 'Faculty Access: You can upload new files (.pdf, .ppt, .xls), re-upload updated lecture slides, or delete old resources.' 
            : 'Student Access: You have read-only access to view and download study notes uploaded by your instructors.'}
        </span>
      </div>

      {/* Upload Modal (Faculty / HOD Only) */}
      {isUploadOpen && isStaff && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '550px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', pb: '0.75rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Upload style={{ color: '#3b82f6' }} /> Upload Study Note / Resource
              </h3>
              <button onClick={() => setIsUploadOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
            </div>

            {successMsg && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle style={{ width: '16px' }} /> {successMsg}
              </div>
            )}

            {errorMsg && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.25rem' }}>Resource Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Unit 3 - PWA Service Worker Notes"
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '0.5rem', background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.25rem' }}>Subject Name</label>
                <select
                  value={subjectName}
                  onChange={(e) => {
                    setSubjectName(e.target.value);
                    if (e.target.value.includes('Software')) setSubjectCode('CS501');
                    else if (e.target.value.includes('Data Science')) setSubjectCode('CS502');
                    else if (e.target.value.includes('Machine Learning')) setSubjectCode('CS503');
                    else setSubjectCode('CS504');
                  }}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '0.5rem', background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff' }}
                >
                  <option value="Software Engineering & PWA">Software Engineering & PWA (CS501)</option>
                  <option value="Data Science & Analytics">Data Science & Analytics (CS502)</option>
                  <option value="Machine Learning Basics">Machine Learning Basics (CS503)</option>
                  <option value="Database Management Systems">Database Management Systems (CS504)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.25rem' }}>
                  Select File (.pdf, .ppt, .pptx, .xls, .xlsx)
                </label>
                <input
                  type="file"
                  accept=".pdf,.ppt,.pptx,.xls,.xlsx,.doc,.docx"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', background: '#0f172a', border: '1px dashed rgba(255, 255, 255, 0.2)', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsUploadOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={uploading} className="btn-primary">
                  <Upload style={{ width: '16px' }} /> {uploading ? 'Uploading File...' : 'Upload Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className="card-glass">
        {loading ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>Loading study notes...</p>
        ) : notes.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No study notes uploaded yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {notes.map((note) => (
              <div key={note.id} style={{ background: '#0f172a', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ background: '#1e293b', padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getFileIcon(note.fileType)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <h4 style={{ fontWeight: 800, color: '#f8fafc', fontSize: '1rem' }}>{note.title}</h4>
                      <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '0.25rem', fontWeight: 700, textTransform: 'uppercase' }}>
                        {note.fileType || 'PDF'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                      Subject: <strong style={{ color: '#e2e8f0' }}>{note.subjectName} ({note.subjectCode})</strong> • Uploaded by: <span style={{ color: '#34d399' }}>{note.uploadedBy}</span>
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                      File: {note.originalName} ({formatFileSize(note.fileSize)})
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button 
                    onClick={() => handleDownload(note.filename, note.originalName)}
                    className="btn-primary"
                    style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}
                  >
                    <Download style={{ width: '16px' }} /> Download
                  </button>

                  {isStaff && (
                    <button 
                      onClick={() => handleDelete(note.id)}
                      className="btn-secondary"
                      style={{ padding: '0.45rem 0.65rem', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                      title="Delete Study Note"
                    >
                      <Trash2 style={{ width: '16px' }} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
