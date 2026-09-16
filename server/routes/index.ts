import { Router } from 'express';
import authRoutes from './authRoutes.js';
import courseRoutes from './courseRoutes.js';
import enrollmentRoutes from './enrollmentRoutes.js';
import progressRoutes from './progressRoutes.js';
import productRoutes from './productRoutes.js';
import cmsRoutes from './cmsRoutes.js';
import seoRoutes from './seoRoutes.js';
import adminRoutes from './adminRoutes.js';
import commerceRoutes from './commerceRoutes.js';
import { seoController } from '../controllers/seoController.js';
import { authController } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/courses', courseRoutes);
apiRouter.use('/enrollments', enrollmentRoutes);
apiRouter.use('/progress', progressRoutes);
apiRouter.use('/files', productRoutes);
apiRouter.use('/cms', cmsRoutes);
apiRouter.use('/seo', seoRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/commerce', commerceRoutes);
apiRouter.post('/instructor/apply', authenticate, authController.applyInstructor);

// Sitemap & Robots
apiRouter.get('/sitemap.xml', seoController.getSitemap);
apiRouter.get('/robots.txt', seoController.getRobots);

export default apiRouter;
