import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { db } from '../db/index.js';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, phone, password } = req.body;
      if (!name || typeof name !== 'string' || !name.trim()) {
        res.status(400).json({ success: false, message: 'نام و نام خانوادگی الزامی است.' });
        return;
      }

      if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
        res.status(400).json({ success: false, message: 'فرمت آدرس ایمیل وارد شده نامعتبر است.' });
        return;
      }

      if (!password || typeof password !== 'string' || password.length < 6) {
        res.status(400).json({ success: false, message: 'رمز عبور باید حداقل دارای ۶ کاراکتر باشد.' });
        return;
      }

      // Feature Toggle check: block instructor registration if disabled
      const requestedRole = req.body.role;
      const requestedRoles = req.body.roles;
      if (!db.siteSetting.isInstructorRegistrationEnabled) {
        if (requestedRole === 'INSTRUCTOR' || requestedRole === 'instructor' || (Array.isArray(requestedRoles) && requestedRoles.includes('INSTRUCTOR'))) {
          res.status(403).json({
            success: false,
            message: 'قابلیت ثبت‌نام مدرس در حال حاضر غیرفعال است.'
          });
          return;
        }
      }

      const result = await authService.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: typeof phone === 'string' ? phone.trim() : undefined,
        password
      });
      res.status(201).json({
        success: true,
        message: 'ثبت‌نام با موفقیت انجام شد.',
        data: result
      });
    } catch (error: any) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const emailOrPhone = req.body.emailOrPhone || req.body.email || req.body.phone;
      const { password } = req.body;
      if (!emailOrPhone || !password) {
        res.status(400).json({ success: false, message: 'ایمیل/شماره همراه و رمز عبور الزامی است.' });
        return;
      }

      const result = await authService.login(emailOrPhone, password);
      res.json({
        success: true,
        message: 'ورود موفقیت‌آمیز بود.',
        data: result
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'عدم احراز هویت' });
        return;
      }
      const user = await authService.getProfile(req.user.userId);
      res.json({ success: true, data: user });
    } catch (error: any) {
      next(error);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'عدم احراز هویت' });
        return;
      }
      const user = await authService.updateProfile(req.user.userId, req.body);
      res.json({ success: true, message: 'پروفایل به‌روزرسانی شد.', data: user });
    } catch (error: any) {
      next(error);
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'عدم احراز هویت' });
        return;
      }
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        res.status(400).json({ success: false, message: 'رمز عبور فعلی و جدید الزامی است.' });
        return;
      }
      if (typeof newPassword !== 'string' || newPassword.length < 6) {
        res.status(400).json({ success: false, message: 'رمز عبور جدید باید حداقل دارای ۶ کاراکتر باشد.' });
        return;
      }
      const result = await authService.changePassword(req.user.userId, currentPassword, newPassword);
      res.json({ success: true, message: result.message });
    } catch (error: any) {
      next(error);
    }
  }

  async applyInstructor(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!db.siteSetting.isInstructorRegistrationEnabled) {
        res.status(403).json({
          success: false,
          message: 'قابلیت ثبت‌نام مدرس در حال حاضر غیرفعال است.'
        });
        return;
      }

      const { expertise, experienceYears, phone, sampleUrl, proposedTopic, bio } = req.body;
      if (!expertise || !phone) {
        res.status(400).json({
          success: false,
          message: 'لطفاً حوزه تخصص و شماره تماس را تکمیل نمایید.'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'درخواست پیوستن به جمع مدرسان با موفقیت ثبت شد و پس از بررسی با شما تماس گرفته خواهد شد.'
      });
    } catch (error: any) {
      next(error);
    }
  }

  async upgradeToInstructor(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!db.siteSetting.isInstructorRegistrationEnabled) {
        res.status(403).json({
          success: false,
          message: 'قابلیت ثبت‌نام مدرس در حال حاضر غیرفعال است.'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'درخواست ارتقا به مدرس با موفقیت ثبت شد.'
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export const authController = new AuthController();
