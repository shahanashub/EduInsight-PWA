const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  code: { type: String, required: true },
  name: { type: String, required: true },
  internal1: { type: Number, default: null },
  internal2: { type: Number, default: null },
  maxMarks: { type: Number, default: 50 },
  flagged: { type: Boolean, default: false }
});

const StudentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  regNumber: { type: String, default: '24BCA1504' },
  className: { type: String, default: '3rd Year BCA' },
  department: { type: String, default: 'Computer Science' },
  attendance: { type: Number, default: 85 },
  cgpa: { type: Number, default: 8.0 },
  lmsLogins: { type: Number, default: 40 },
  subjects: [SubjectSchema],
  skills: [{ type: String }],
  certifications: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', StudentSchema);
