const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const storage = require('../db/storage');

const router = express.Router();

// 1. Get current logged-in student's profile & marks (Read-Only for Students)
router.get('/my-profile', authenticateToken, authorizeRoles('student'), async (req, res) => {
  let student = await storage.findStudentByUserId(req.user.id);
  
  if (!student) {
    // auto-create initial student record for logged-in user if missing
    student = await storage.upsertStudent({
      userId: req.user.id,
      name: req.user.name,
      email: req.user.email,
      regNumber: '24BCA1504',
      className: '3rd Year BCA (Data Science & Full Stack)',
      department: 'Computer Science',
      attendance: 88,
      cgpa: 8.2,
      lmsLogins: 42,
      subjects: [
        { code: 'CS501', name: 'Software Engineering & PWA', internal1: 38, internal2: 40, maxMarks: 50, flagged: false },
        { code: 'CS502', name: 'Data Science & Analytics', internal1: 21, internal2: 24, maxMarks: 50, flagged: true },
        { code: 'CS503', name: 'Machine Learning Basics', internal1: 19, internal2: 22, maxMarks: 50, flagged: true },
        { code: 'CS504', name: 'Database Management Systems', internal1: 44, internal2: 45, maxMarks: 50, flagged: false }
      ],
      skills: ['Python', 'JavaScript', 'React', 'Data Analysis', 'SQL'],
      certifications: ['Web Development Fundamentals', 'Data Science Essentials']
    });
  }

  res.json({ student });
});

// 2. Faculty / HOD / Admin Endpoint: Update Student Marks & Attendance (Edit access for Staff)
router.post('/update-student-marks', authenticateToken, authorizeRoles('faculty', 'hod', 'admin'), async (req, res) => {
  const { studentId, subjects, attendance, cgpa, skills, certifications, lmsLogins } = req.body;
  
  if (!studentId) {
    return res.status(400).json({ message: 'studentId is required.' });
  }

  const allStudents = await storage.getStudents();
  const currentStudent = (await storage.findStudentById(studentId)) || allStudents.find(s => s.userId === studentId || s.id === studentId);
  
  if (!currentStudent) {
    return res.status(404).json({ message: 'Student record not found.' });
  }

  const settings = await storage.getSettings();
  const thresholdPercent = settings.passThresholdPercent || 50;

  // Re-eval subject flagged status based on threshold %
  const processedSubjects = (subjects || []).map(sub => {
    const i1 = parseFloat(sub.internal1);
    const max = parseFloat(sub.maxMarks) || 50;
    const percent1 = !isNaN(i1) ? (i1 / max) * 100 : 100;
    
    let percent2 = 100;
    if (sub.internal2 !== null && sub.internal2 !== undefined && sub.internal2 !== '') {
      const i2 = parseFloat(sub.internal2);
      percent2 = !isNaN(i2) ? (i2 / max) * 100 : 100;
    }

    const flagged = percent1 < thresholdPercent || percent2 < thresholdPercent;
    return {
      ...sub,
      internal1: !isNaN(i1) ? i1 : null,
      internal2: sub.internal2 !== null && sub.internal2 !== undefined && sub.internal2 !== '' ? parseFloat(sub.internal2) : null,
      flagged
    };
  });

  const updatedData = {
    ...currentStudent,
    ...(attendance !== undefined && { attendance: parseFloat(attendance) }),
    ...(cgpa !== undefined && { cgpa: parseFloat(cgpa) }),
    ...(lmsLogins !== undefined && { lmsLogins: parseInt(lmsLogins, 10) }),
    ...(skills !== undefined && { skills }),
    ...(certifications !== undefined && { certifications }),
    subjects: processedSubjects.length > 0 ? processedSubjects : currentStudent.subjects || []
  };

  const saved = await storage.upsertStudent(updatedData);
  res.json({ message: 'Student marks updated successfully in MongoDB.', student: saved });
});

// 3. Faculty endpoint: get all students in their class
router.get('/class-list', authenticateToken, authorizeRoles('faculty', 'admin', 'hod'), async (req, res) => {
  const allStudents = await storage.getStudents();
  
  const flaggedCount = allStudents.filter(s => (s.subjects || []).some(sub => sub.flagged)).length;

  res.json({
    totalStudents: allStudents.length,
    flaggedStudentsCount: flaggedCount,
    students: allStudents
  });
});

// 4. HOD endpoint: department-wide aggregated analytics
router.get('/department-summary', authenticateToken, authorizeRoles('hod', 'admin'), async (req, res) => {
  const allStudents = await storage.getStudents();
  const settings = await storage.getSettings();

  const total = allStudents.length;
  let flaggedTotal = 0;
  let subjectRiskCounts = {};
  let totalAttendance = 0;

  allStudents.forEach(s => {
    let studentHasRisk = false;
    totalAttendance += (s.attendance || 80);
    (s.subjects || []).forEach(sub => {
      if (sub.flagged) {
        studentHasRisk = true;
        subjectRiskCounts[sub.name] = (subjectRiskCounts[sub.name] || 0) + 1;
      }
    });
    if (studentHasRisk) flaggedTotal++;
  });

  const avgAttendance = total > 0 ? (totalAttendance / total).toFixed(1) : 85;

  res.json({
    department: 'Computer Science & Data Analytics',
    totalStudents: total,
    flaggedStudentsCount: flaggedTotal,
    overallRiskPercentage: total > 0 ? Math.round((flaggedTotal / total) * 100) : 0,
    averageAttendance: parseFloat(avgAttendance),
    subjectRiskDistribution: subjectRiskCounts,
    facultyList: [
      { name: 'Greeshma C Poojary', subject: 'Software Engineering & PWA', class: '3rd Year BCA', flaggedCount: Math.ceil(flaggedTotal * 0.4) },
      { name: 'Dr. Rathnakar Shetty P', subject: 'Data Science & Big Data', class: '3rd Year BCA', flaggedCount: Math.ceil(flaggedTotal * 0.6) }
    ]
  });
});

module.exports = router;
