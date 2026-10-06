import { Router } from 'express';
import multer from 'multer';
import { storageController } from '../controllers/storageController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max file size
  },
});

// Storage status and diagnostic test
router.get('/status', storageController.getStatus);
router.post('/test', storageController.testConnection);

// File uploads
router.post('/upload', optionalAuth, upload.single('file'), storageController.upload);
router.post('/presigned-upload', optionalAuth, storageController.getPresignedUploadUrl);

// File management
router.get('/files', optionalAuth, storageController.listFiles);
router.delete('/files', optionalAuth, storageController.deleteFile);

// Config update
router.put('/config', authenticate, storageController.updateConfig);

export default router;
