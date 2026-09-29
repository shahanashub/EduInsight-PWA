const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth.routes');
const studentRoutes = require('./routes/student.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const notesRoutes = require('./routes/notes.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS & JSON parsing
app.use(cors());
app.use(express.json());

// Healthcheck Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'EduInsight Backend API',
    time: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Route Handlers
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notes', notesRoutes);

// Serve Frontend PWA static files if built
const frontendDist = path.join(__dirname, '../frontend/dist');
const fs = require('fs');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send(`
      <div style="font-family: sans-serif; padding: 2rem; background: #0f172a; color: #f8fafc; min-height: 100vh;">
        <h2>🎓 EduInsight Backend API is running on Port 5000!</h2>
        <p>The Frontend PWA interface runs on <a href="http://localhost:3000" style="color: #60a5fa;">http://localhost:3000</a> (via <code>npm run dev:frontend</code>).</p>
        <p>Alternatively, run <code>cd frontend && npm run build</code> to serve the PWA directly from this backend server!</p>
      </div>
    `);
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

app.listen(PORT, () => {
  console.log(`EduInsight Server running on http://localhost:${PORT}`);
  console.log(`Frontend UI available at http://localhost:3000 (dev) or http://localhost:${PORT} (production)`);
});

