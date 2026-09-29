const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');
const storage = require('../db/storage');

const router = express.Router();

// Registration Endpoint
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, verificationCode, regNumber, className, department } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required.' });
    }

    const settings = await storage.getSettings();

    // 1. Institutional Email Domain Check
    const emailDomain = email.split('@')[1];
    if (settings.institutionDomain && (!emailDomain || !emailDomain.toLowerCase().endsWith(settings.institutionDomain.toLowerCase()))) {
      return res.status(400).json({
        message: `Registration failed. Email must belong to institution domain (@${settings.institutionDomain}).`
      });
    }

    // 2. Role Verification Code Check
    if (role === 'faculty') {
      if (verificationCode !== settings.facultyCode) {
        return res.status(403).json({ message: 'Invalid Faculty verification code.' });
      }
    } else if (role === 'hod') {
      if (verificationCode !== settings.hodCode) {
        return res.status(403).json({ message: 'Invalid HOD verification code.' });
      }
    } else if (role === 'admin') {
      return res.status(403).json({ message: 'Admin accounts cannot be self-registered. Contact system setup.' });
    }

    // 3. Existing User Check
    const existing = await storage.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // 4. Password Hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: 'usr_' + Date.now(),
      name,
      email,
      password: hashedPassword,
      role,
      department: department || 'Computer Science',
      className: className || '3rd Year BCA',
      createdAt: new Date().toISOString()
    };

    await storage.createUser(newUser);

    // If student, create initial student record
    if (role === 'student') {
      await storage.upsertStudent({
        userId: newUser.id,
        name: newUser.name,
        email: newUser.email,
        regNumber: regNumber || '24BCA' + Math.floor(1000 + Math.random() * 9000),
        className: newUser.className,
        department: newUser.department,
        attendance: 85,
        cgpa: 8.0,
        subjects: [
          { code: 'CS501', name: 'Software Engineering', internal1: 38, internal2: null, maxMarks: 50, flagged: false },
          { code: 'CS502', name: 'Data Science & Big Data', internal1: 22, internal2: null, maxMarks: 50, flagged: true },
          { code: 'CS503', name: 'Web Analytics & PWA', internal1: 42, internal2: null, maxMarks: 50, flagged: false },
          { code: 'CS504', name: 'Machine Learning', internal1: 18, internal2: null, maxMarks: 50, flagged: true }
        ],
        skills: ['Python', 'JavaScript', 'SQL', 'HTML/CSS'],
        certifications: ['Basic Data Science', 'Web Development Fundamentals']
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        className: newUser.className
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error during registration.' });
  }
});

// Login Endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await storage.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        className: user.className
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error during login.' });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  const user = await storage.findUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }
  const { password, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

module.exports = router;
