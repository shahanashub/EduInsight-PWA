const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  institutionDomain: { type: String, default: 'yenepoya.edu.in' },
  facultyCode: { type: String, default: 'FACULTY2026' },
  hodCode: { type: String, default: 'HOD2026' },
  passThresholdPercent: { type: Number, default: 50 },
  maxMarksPerSubject: { type: Number, default: 50 },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Settings', SettingsSchema);
