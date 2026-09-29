const express = require('express');
const http = require('http');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const storage = require('../db/storage');

const router = express.Router();

// Helper: Call Python FastAPI ML Service
function callMLService(studentData) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      attendance: studentData.attendance || 85,
      avg_assessment_score: calculateAvgScore(studentData.subjects),
      lms_logins: studentData.lmsLogins || 35
    });

    const options = {
      hostname: '127.0.0.1',
      port: 8000,
      path: '/predict',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 3000
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const data = JSON.parse(body);
            resolve(data);
          } else {
            resolve(getRuleBasedRiskFallback(studentData));
          }
        } catch (e) {
          resolve(getRuleBasedRiskFallback(studentData));
        }
      });
    });

    req.on('error', () => {
      resolve(getRuleBasedRiskFallback(studentData));
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(getRuleBasedRiskFallback(studentData));
    });

    req.write(postData);
    req.end();
  });
}

function calculateAvgScore(subjects = []) {
  if (!subjects || subjects.length === 0) return 70;
  let totalPct = 0;
  let count = 0;
  subjects.forEach(s => {
    const max = parseFloat(s.maxMarks) || 50;
    if (s.internal1 !== null && s.internal1 !== undefined) {
      totalPct += (parseFloat(s.internal1) / max) * 100;
      count++;
    }
    if (s.internal2 !== null && s.internal2 !== undefined) {
      totalPct += (parseFloat(s.internal2) / max) * 100;
      count++;
    }
  });
  return count > 0 ? parseFloat((totalPct / count).toFixed(1)) : 70;
}

function getRuleBasedRiskFallback(studentData) {
  const avg = calculateAvgScore(studentData.subjects);
  const att = studentData.attendance || 85;
  const flaggedCount = (studentData.subjects || []).filter(s => s.flagged).length;

  let riskLevel = 'low';
  let confidence = 0.85;

  if (flaggedCount >= 2 || avg < 50 || att < 75) {
    riskLevel = 'high';
    confidence = 0.92;
  } else if (flaggedCount === 1 || avg < 65 || att < 80) {
    riskLevel = 'medium';
    confidence = 0.78;
  }

  return {
    risk_level: riskLevel,
    confidence_score: confidence,
    source: 'Rule-based Analytics Engine (Fallback)'
  };
}

// Generate Quantified Study Plan & Career Recommendations
router.get('/recommendations', authenticateToken, async (req, res) => {
  let student = await storage.findStudentByUserId(req.user.id);
  
  if (!student) {
    const all = await storage.getStudents();
    student = all[0] || {
      name: req.user.name,
      attendance: 85,
      cgpa: 8.0,
      subjects: [
        { name: 'Software Engineering', internal1: 38, maxMarks: 50, flagged: false },
        { name: 'Data Science & Big Data', internal1: 22, maxMarks: 50, flagged: true }
      ],
      skills: ['Python', 'SQL']
    };
  }

  // 1. Get ML Prediction
  const mlResult = await callMLService(student);

  // 2. Generate Quantified Study Plans for Flagged Subjects
  const flaggedSubjects = (student.subjects || []).filter(s => s.flagged);
  const studyPlans = flaggedSubjects.map(sub => {
    const score = parseFloat(sub.internal1) || 20;
    const max = parseFloat(sub.maxMarks) || 50;
    const gap = max - score;

    const dailyHours = gap > 25 ? 2.5 : gap > 15 ? 2.0 : 1.5;
    const durationDays = gap > 25 ? 14 : gap > 15 ? 10 : 7;
    const projectedIncrease = Math.min(Math.round(gap * 0.7), max - score);
    const projectedScore = score + projectedIncrease;

    let topics = [];
    if (sub.name.toLowerCase().includes('data science') || sub.name.toLowerCase().includes('machine learning')) {
      topics = ['Feature Selection & Preprocessing', 'Decision Tree Classification', 'Model Evaluation Metrics (F1 / Recall)', 'Overfitting & Regularization'];
    } else if (sub.name.toLowerCase().includes('software') || sub.name.toLowerCase().includes('web') || sub.name.toLowerCase().includes('pwa')) {
      topics = ['Service Workers & Cache API', 'Web App Manifest Setup', 'REST API Architecture', 'JWT Authentication & Security'];
    } else {
      topics = ['Core Theory & Definitions', 'Problem Solving & Sample Papers', 'Key Formulae & Algorithms', 'Previous Exam Revision'];
    }

    return {
      subjectCode: sub.code || 'SUB101',
      subjectName: sub.name,
      currentScore: score,
      maxMarks: max,
      scoreGap: gap,
      recommendedDailyHours: dailyHours,
      suggestedDurationDays: durationDays,
      totalPlanHours: parseFloat((dailyHours * durationDays).toFixed(1)),
      projectedScore: projectedScore,
      focusTopics: topics,
      rationale: `Based on your score of ${score}/${max} in ${sub.name}, dedicating ${dailyHours} hours/day over ${durationDays} days targetting weak topics will help project your performance to ${projectedScore}/${max}.`
    };
  });

  // 3. Generate Course & Job Role Suggestions based on Strongest Subject & Skills
  const sortedByScore = [...(student.subjects || [])].sort((a, b) => (parseFloat(b.internal1) || 0) - (parseFloat(a.internal1) || 0));
  const topSubject = sortedByScore[0] ? sortedByScore[0].name : 'Computer Science';

  const courseSuggestions = [
    {
      title: 'Advanced Progressive Web Apps & Offline First',
      platform: 'EduInsight Academy',
      duration: '4 Weeks',
      reason: `Complements your performance in ${topSubject} and skills in ${student.skills?.[0] || 'Web Development'}.`
    },
    {
      title: 'Practical Machine Learning with Scikit-Learn & FastAPI',
      platform: 'Yenepoya eLearning',
      duration: '6 Weeks',
      reason: 'Enhances your data science proficiency for higher placement readiness.'
    }
  ];

  const jobRoleSuggestions = [
    {
      title: 'Full Stack PWA Developer',
      matchPercentage: 92,
      requiredSkills: ['React', 'Node.js', 'Service Workers', 'PWA', 'REST API'],
      missingSkills: ['Docker', 'TypeScript'],
      avgSalaryRange: '₹5.5L - ₹8.5L / year'
    },
    {
      title: 'Junior Data Analyst / ML Engineer',
      matchPercentage: 86,
      requiredSkills: ['Python', 'Scikit-learn', 'Pandas', 'SQL', 'FastAPI'],
      missingSkills: ['TensorFlow', 'Tableau'],
      avgSalaryRange: '₹6.0L - ₹9.0L / year'
    }
  ];

  res.json({
    overallRisk: mlResult,
    studyPlans,
    courseSuggestions,
    jobRoleSuggestions,
    generatedAt: new Date().toISOString()
  });
});

// Admin Settings GET/POST
router.get('/settings', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const settings = await storage.getSettings();
  res.json({ settings });
});

router.post('/settings', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const updated = await storage.updateSettings(req.body);
  res.json({ message: 'Settings updated successfully in MongoDB.', settings: updated });
});

module.exports = router;
