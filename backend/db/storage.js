const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User.model');
const Student = require('../models/Student.model');
const Settings = require('../models/Settings.model');

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eduinsight';
let isMongoConnected = false;

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 2000
}).then(() => {
  isMongoConnected = true;
  console.log(`MongoDB Connected successfully to ${MONGODB_URI}`);
  seedMongoData();
}).catch(err => {
  isMongoConnected = false;
  console.log(`MongoDB not running locally (${err.message}). Using hybrid persistence layer.`);
});

// Seed Initial Data to MongoDB if empty
async function seedMongoData() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding initial demo accounts into MongoDB database...');
      await User.insertMany([
        {
          id: 'usr_student_1',
          name: 'Abdul Shahanas P P',
          email: 'abdul.shahanas@yenepoya.edu.in',
          password: bcrypt.hashSync('student123', 10),
          role: 'student',
          department: 'Computer Science',
          className: '3rd Year BCA'
        },
        {
          id: 'usr_faculty_1',
          name: 'Greeshma C Poojary',
          email: 'greeshma.poojary@yenepoya.edu.in',
          password: bcrypt.hashSync('faculty123', 10),
          role: 'faculty',
          department: 'Computer Science',
          className: '3rd Year BCA'
        },
        {
          id: 'usr_hod_1',
          name: 'Dr. Rathnakar Shetty P',
          email: 'rathnakar.shetty@yenepoya.edu.in',
          password: bcrypt.hashSync('hod123', 10),
          role: 'hod',
          department: 'Computer Science',
          className: 'All Department Classes'
        }
      ]);
    }

    const studentCount = await Student.countDocuments();
    if (studentCount === 0) {
      console.log('Seeding initial student records into MongoDB database...');
      await Student.insertMany([
        {
          id: 'std_1',
          userId: 'usr_student_1',
          name: 'Abdul Shahanas P P',
          email: 'abdul.shahanas@yenepoya.edu.in',
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
        },
        {
          id: 'std_2',
          userId: 'usr_student_2',
          name: 'Mohammed Rizwan',
          email: 'mohammed.rizwan@yenepoya.edu.in',
          regNumber: '24BCA1509',
          className: '3rd Year BCA (Data Science & Full Stack)',
          department: 'Computer Science',
          attendance: 72,
          cgpa: 7.1,
          lmsLogins: 18,
          subjects: [
            { code: 'CS501', name: 'Software Engineering & PWA', internal1: 22, internal2: 25, maxMarks: 50, flagged: true },
            { code: 'CS502', name: 'Data Science & Analytics', internal1: 18, internal2: 20, maxMarks: 50, flagged: true },
            { code: 'CS503', name: 'Machine Learning Basics', internal1: 15, internal2: 19, maxMarks: 50, flagged: true },
            { code: 'CS504', name: 'Database Management Systems', internal1: 30, internal2: 32, maxMarks: 50, flagged: false }
          ],
          skills: ['HTML/CSS', 'Python'],
          certifications: ['Basic Programming']
        }
      ]);
    }

    const settingsCount = await Settings.countDocuments();
    if (settingsCount === 0) {
      await Settings.create({
        institutionDomain: 'yenepoya.edu.in',
        facultyCode: 'FACULTY2026',
        hodCode: 'HOD2026',
        passThresholdPercent: 50,
        maxMarksPerSubject: 50
      });
    }
  } catch (err) {
    console.error('Mongo seed error:', err);
  }
}

// Memory / File fallback storage
const DATA_DIR = path.join(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const STUDENTS_FILE = path.join(DATA_DIR, 'students.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJSON(file, defaultData = []) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return defaultData;
  }
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// User Helpers (Async MongoDB with sync/async fallback)
async function findUserByEmail(email) {
  if (isMongoConnected) {
    const doc = await User.findOne({ email: email.toLowerCase() }).lean();
    if (doc) return doc;
  }
  const users = readJSON(USERS_FILE, []);
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

async function findUserById(id) {
  if (isMongoConnected) {
    const doc = await User.findOne({ id }).lean();
    if (doc) return doc;
  }
  const users = readJSON(USERS_FILE, []);
  return users.find(u => u.id === id);
}

async function createUser(userData) {
  if (isMongoConnected) {
    const doc = await User.create(userData);
    return doc.toObject();
  }
  const users = readJSON(USERS_FILE, []);
  users.push(userData);
  writeJSON(USERS_FILE, users);
  return userData;
}

// Student Helpers
async function getStudents() {
  if (isMongoConnected) {
    const docs = await Student.find({}).lean();
    if (docs && docs.length > 0) return docs;
  }
  return readJSON(STUDENTS_FILE, []);
}

async function findStudentByUserId(userId) {
  if (isMongoConnected) {
    const doc = await Student.findOne({ userId }).lean();
    if (doc) return doc;
  }
  const students = readJSON(STUDENTS_FILE, []);
  return students.find(s => s.userId === userId);
}

async function findStudentById(id) {
  if (isMongoConnected) {
    const doc = await Student.findOne({ id }).lean();
    if (doc) return doc;
  }
  const students = readJSON(STUDENTS_FILE, []);
  return students.find(s => s.id === id);
}

async function upsertStudent(studentData) {
  if (isMongoConnected) {
    const filter = studentData.userId ? { userId: studentData.userId } : { id: studentData.id };
    const updated = await Student.findOneAndUpdate(
      filter,
      { ...studentData, updatedAt: new Date() },
      { new: true, upsert: true }
    ).lean();
    return updated;
  }

  const students = readJSON(STUDENTS_FILE, []);
  const index = students.findIndex(s => s.userId === studentData.userId || s.id === studentData.id);
  if (index !== -1) {
    students[index] = { ...students[index], ...studentData, updatedAt: new Date().toISOString() };
    writeJSON(STUDENTS_FILE, students);
    return students[index];
  } else {
    const newStudent = {
      id: studentData.id || 'std_' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...studentData
    };
    students.push(newStudent);
    writeJSON(STUDENTS_FILE, students);
    return newStudent;
  }
}

// Settings Helpers
async function getSettings() {
  if (isMongoConnected) {
    const doc = await Settings.findOne({}).lean();
    if (doc) return doc;
  }
  return readJSON(SETTINGS_FILE, {
    institutionDomain: 'yenepoya.edu.in',
    facultyCode: 'FACULTY2026',
    hodCode: 'HOD2026',
    passThresholdPercent: 50,
    maxMarksPerSubject: 50
  });
}

async function updateSettings(newSettings) {
  if (isMongoConnected) {
    const updated = await Settings.findOneAndUpdate(
      {},
      { ...newSettings, updatedAt: new Date() },
      { new: true, upsert: true }
    ).lean();
    return updated;
  }
  const current = await getSettings();
  const updated = { ...current, ...newSettings };
  writeJSON(SETTINGS_FILE, updated);
  return updated;
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  getStudents,
  findStudentByUserId,
  findStudentById,
  upsertStudent,
  getSettings,
  updateSettings,
  isMongoConnected: () => isMongoConnected
};
