import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import apiRouter from './server/routes/index.js';
import { seoController } from './server/controllers/seoController.js';
import { errorHandler } from './server/middleware/errorHandler.js';
import { corsMiddleware } from './server/middleware/cors.js';
import { runBackendTests } from './server/tests/runTests.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust proxy for Cloud Run & Nginx reverse proxy headers (X-Forwarded-For, etc.)
  app.set('trust proxy', 1);

  // CORS Middleware for production origin restriction & dev flexibility
  app.use(corsMiddleware);

  // JSON Body Parser
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Routes (FIRST)
  app.use('/api', apiRouter);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Lumina Learn Production API',
      version: '1.0.0'
    });
  });

  // Root SEO endpoints
  app.get('/sitemap.xml', (req, res) => seoController.getSitemap(req, res));
  app.get('/robots.txt', (req, res) => seoController.getRobots(req, res));

  // Run backend self-tests on bootstrap
  try {
    await runBackendTests();
  } catch (err) {
    console.error('Test execution error:', err);
  }

  // Vite middleware for development vs static in production
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

  // Error handling middleware
  app.use(errorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Lumina Learn Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
