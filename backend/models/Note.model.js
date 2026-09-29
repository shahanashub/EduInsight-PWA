const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  subjectCode: { type: String, default: 'GEN101' },
  subjectName: { type: String, required: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  fileSize: { type: Number, default: 0 },
  fileType: { type: String, default: 'pdf' }, // 'pdf' | 'ppt' | 'xls' | 'doc' | 'other'
  uploadedBy: { type: String, default: 'Greeshma C Poojary' },
  uploadedByRole: { type: String, default: 'faculty' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Note', NoteSchema);
