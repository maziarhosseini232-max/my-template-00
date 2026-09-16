import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

// Rate limiter for authentication routes to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // Reasonable threshold for regular users and testing
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    xForwardedForHeader: false,
    forwardedHeader: false,
    trustProxy: false,
    default: false
  },
  keyGenerator: (req) => {
    return (
      (req.headers['cf-connecting-ip'] as string) ||
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      req.socket?.remoteAddress ||
      'unknown-client'
    );
  },
  message: {
    success: false,
    message: 'تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً پس از ۱۵ دقیقه مجدداً تلاش نمایید.'
  }
});

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, logAudit('LOGIN', 'USER'), authController.login);
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, logAudit('UPDATE_PROFILE', 'USER'), authController.updateProfile);
router.post('/change-password', authenticate, logAudit('CHANGE_PASSWORD', 'USER'), authController.changePassword);
router.post('/apply-instructor', authenticate, logAudit('APPLY_INSTRUCTOR', 'USER'), authController.applyInstructor);
router.post('/instructor/apply', authenticate, logAudit('APPLY_INSTRUCTOR', 'USER'), authController.applyInstructor);
router.post('/upgrade-to-instructor', authenticate, logAudit('UPGRADE_INSTRUCTOR', 'USER'), authController.upgradeToInstructor);

export default router;
