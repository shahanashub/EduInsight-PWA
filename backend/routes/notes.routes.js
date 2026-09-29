const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const Note = require('../models/Note.model');

const router = express.Router();

// Upload Directory Setup
const UPLOAD_DIR = path.join(__dirname, '../uploads/notes');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer Storage Engine
const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'note-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storageConfig,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.ppt', '.pptx', '.xls', '.xlsx', '.doc', '.docx', '.png', '.jpg', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Allowed formats: PDF, PPT, PPTX, XLS, XLSX, DOC, DOCX.'));
    }
  }
});

// Seed default sample notes if empty
async function getNotesFromDB() {
  try {
    let notes = await Note.find({}).sort({ createdAt: -1 }).lean();
    if (!notes || notes.length === 0) {
      const defaultNotes = [
        {
          id: 'note_1',
          title: 'Software Engineering & PWA Service Workers Guide',
          subjectCode: 'CS501',
          subjectName: 'Software Engineering & PWA',
          filename: 'sample_pwa_guide.pdf',
          originalName: 'PWA_ServiceWorker_Architecture.pdf',
          fileSize: 2450000,
          fileType: 'pdf',
          uploadedBy: 'Greeshma C Poojary',
          uploadedByRole: 'faculty',
          createdAt: new Date()
        },
        {
          id: 'note_2',
          title: 'Data Science & Feature Preprocessing Reference Slides',
          subjectCode: 'CS502',
          subjectName: 'Data Science & Analytics',
          filename: 'sample_ds_slides.pptx',
          originalName: 'DataScience_DecisionTree_Slides.pptx',
          fileSize: 4200000,
          fileType: 'ppt',
          uploadedBy: 'Dr. Rathnakar Shetty P',
          uploadedByRole: 'hod',
          createdAt: new Date()
        },
        {
          id: 'note_3',
          title: 'Machine Learning Model Evaluation Formulas & Excel Sheet',
          subjectCode: 'CS503',
          subjectName: 'Machine Learning Basics',
          filename: 'sample_ml_formulas.xlsx',
          originalName: 'ML_Metrics_Precision_Recall.xlsx',
          fileSize: 1100000,
          fileType: 'xls',
          uploadedBy: 'Greeshma C Poojary',
          uploadedByRole: 'faculty',
          createdAt: new Date()
        }
      ];
      await Note.insertMany(defaultNotes);
      notes = await Note.find({}).sort({ createdAt: -1 }).lean();
    }
    return notes;
  } catch (err) {
    console.error('Error querying notes:', err);
    return [];
  }
}

// 1. GET ALL NOTES (Students & Faculty can view)
router.get('/', authenticateToken, async (req, res) => {
  const notes = await getNotesFromDB();
  res.json({ notes });
});

// 2. DOWNLOAD NOTE FILE (Students & Faculty can download)
router.get('/download/:filename', authenticateToken, (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(UPLOAD_DIR, filename);

  if (fs.existsSync(filePath)) {
    return res.download(filePath);
  }

  // Fallback demo content if physical sample file not yet written
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(`EduInsight Study Notes Resource File: ${filename}\nUploaded by Faculty for Student Reference.`);
});

// 3. UPLOAD / REUPLOAD STUDY NOTE (FACULTY & HOD ONLY)
router.post('/upload', authenticateToken, authorizeRoles('faculty', 'hod', 'admin'), upload.single('file'), async (req, res) => {
  try {
    const { title, subjectCode, subjectName } = req.body;
    
    if (!req.file && !req.body.filename) {
      return res.status(400).json({ message: 'File upload is required.' });
    }

    const file = req.file;
    const ext = file ? path.extname(file.originalname).toLowerCase().replace('.', '') : 'pdf';
    let fileType = 'pdf';
    if (['ppt', 'pptx'].includes(ext)) fileType = 'ppt';
    else if (['xls', 'xlsx'].includes(ext)) fileType = 'xls';
    else if (['doc', 'docx'].includes(ext)) fileType = 'doc';

    const newNote = {
      id: 'note_' + Date.now(),
      title: title || file?.originalname || 'Study Note',
      subjectCode: subjectCode || 'CS501',
      subjectName: subjectName || 'Computer Science',
      filename: file ? file.filename : 'note_' + Date.now() + '.pdf',
      originalName: file ? file.originalname : 'Document.pdf',
      fileSize: file ? file.size : 1500000,
      fileType: fileType,
      uploadedBy: req.user.name,
      uploadedByRole: req.user.role,
      createdAt: new Date()
    };

    const doc = await Note.create(newNote);
    res.status(201).json({ message: 'Study note uploaded successfully!', note: doc.toObject() });
  } catch (error) {
    console.error('Note upload error:', error);
    res.status(500).json({ message: error.message || 'Error uploading file note.' });
  }
});

// 4. DELETE STUDY NOTE (FACULTY & HOD ONLY)
router.delete('/:id', authenticateToken, authorizeRoles('faculty', 'hod', 'admin'), async (req, res) => {
  try {
    const noteId = req.params.id;
    const note = await Note.findOne({ id: noteId });

    if (note && note.filename) {
      const filePath = path.join(UPLOAD_DIR, note.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Note.deleteOne({ id: noteId });
    res.json({ message: 'Study note deleted successfully.' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ message: 'Error deleting study note.' });
  }
});

module.exports = router;
