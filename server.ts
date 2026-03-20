import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(
    cors({
      origin: [
        'http://localhost:5173', 
        'http://localhost:3000', 
        process.env.APP_URL || 'https://your-admin-site.vercel.app'
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'UniVerse API is running' });
  });

  // --- User Management APIs ---

  // Get current user profile
  app.get('/api/users/me', async (req, res) => {
    res.json({ success: true, data: { id: '1', email: 'admin@universe.edu', firstName: 'Admin', lastName: 'User', role: 'ADMIN', interests: [], badges: [], followers: [], following: [] } });
  });

  // Update user profile (Onboarding & Settings)
  app.put('/api/users/me', async (req, res) => {
    res.json({ success: true, data: req.body });
  });

  // Get all users (Network/Search)
  app.get('/api/users', async (req, res) => {
    res.json({ success: true, data: [] });
  });

  // Follow a user
  app.post('/api/users/:id/follow', async (req, res) => {
    res.json({ success: true });
  });

  // Unfollow a user
  app.delete('/api/users/:id/follow', async (req, res) => {
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const httpServer = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Mock real-time data updates
  let totalUsers = 11550;
  let activeStudents = 8432;
  let serverHealth = 99.9;
  let reportsPending = 42;

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Send initial data
    socket.emit('dashboard_stats', {
      totalUsers,
      activeStudents,
      serverHealth: serverHealth.toFixed(1),
      reportsPending
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Simulate live updates every 3 seconds
  setInterval(() => {
    totalUsers += Math.floor(Math.random() * 3);
    activeStudents += Math.floor(Math.random() * 5) - 2; // Can go up or down slightly
    serverHealth = Math.min(100, Math.max(90, serverHealth + (Math.random() * 0.4 - 0.2)));
    reportsPending += Math.floor(Math.random() * 3) - 1;
    if (reportsPending < 0) reportsPending = 0;

    io.emit('dashboard_stats', {
      totalUsers,
      activeStudents,
      serverHealth: serverHealth.toFixed(1),
      reportsPending
    });

    // Randomly send a critical alert (5% chance every 3 seconds)
    if (Math.random() < 0.05) {
      const alerts = [
        'High CPU usage detected on Node-1',
        'Database connection latency spike',
        'Multiple failed login attempts detected',
        'Memory usage exceeding 90% threshold'
      ];
      io.emit('critical_alert', {
        id: Date.now(),
        message: alerts[Math.floor(Math.random() * alerts.length)],
        time: new Date().toLocaleTimeString()
      });
    }
  }, 3000);
}

startServer();
