import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class AdminController {
  async getDashboardStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const totalUsers = db.users.filter(u => !u.deletedAt).length;
      const totalCourses = db.courses.filter(c => !c.deletedAt).length;
      const totalEnrollments = db.enrollments.filter(e => e.isActive).length;
      const totalProducts = db.digitalProducts.length;
      const totalDownloads = db.digitalProducts.reduce((acc, p) => acc + p.downloadCount, 0);

      res.json({
        success: true,
        data: {
          totalUsers,
          totalCourses,
          totalEnrollments,
          totalProducts,
          totalDownloads,
          activeStudentsCount: db.users.filter(u => u.roles.includes('STUDENT')).length,
          instructorsCount: db.users.filter(u => u.roles.includes('INSTRUCTOR')).length
        }
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const users = db.users.map(({ passwordHash, ...user }) => user);
      res.json({ success: true, count: users.length, data: users });
    } catch (error: any) {
      next(error);
    }
  }

  async updateUserRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { roles } = req.body;
      const user = db.users.find(u => u.id === req.params.id);
      if (!user) {
        res.status(404).json({ success: false, message: 'کاربر یافت نشد.' });
        return;
      }

      user.roles = roles;
      user.updatedAt = new Date().toISOString();
      const { passwordHash, ...userSafe } = user;
      res.json({ success: true, message: 'نقش‌های کاربر به‌روزرسانی شد.', data: userSafe });
    } catch (error: any) {
      next(error);
    }
  }

  async getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const logs = [...db.auditLogs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      res.json({ success: true, count: logs.length, data: logs.slice(0, 100) });
    } catch (error: any) {
      next(error);
    }
  }

  async wipeTestData(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { confirmation } = req.body;
      if (!confirmation || confirmation.trim().toUpperCase() !== 'CONFIRM') {
        res.status(400).json({
          success: false,
          message: 'برای تایید پاکسازی داده‌ها، لطفاً کلمه CONFIRM را تایپ کنید.'
        });
        return;
      }

      const initialCoursesCount = db.courses.length;
      const initialEnrollmentsCount = db.enrollments.length;
      const initialReviewsCount = db.reviews.length;
      const initialOrdersCount = db.orders.length;
      const initialUsersCount = db.users.length;

      // Keep only OWNER and ADMIN accounts, guaranteeing admin@lumina.com and maziarhosseini232@gmail.com are strictly retained
      const preservedUsers = db.users.filter(u => {
        const isOwnerOrAdmin = u.roles?.some(r => r === 'OWNER' || r === 'ADMIN') || 
                               u.email === 'admin@lumina.com' ||
                               u.email === 'maziarhosseini232@gmail.com';
        return isOwnerOrAdmin;
      }).map(u => ({
        ...u,
        walletBalance: 0,
        subscriptionPlanId: undefined,
        subscriptionStartDate: undefined,
        subscriptionEndDate: undefined,
        subscriptionStatus: undefined,
        isVip: false
      }));

      // Guarantee admin@lumina.com account exists with 123456 password
      let adminAccount = preservedUsers.find(u => u.email === 'admin@lumina.com');
      if (!adminAccount) {
        const passwordHash = bcrypt.hashSync('123456', 10);
        adminAccount = {
          id: 'usr_admin_2',
          name: 'مدیر ارشد لومینا',
          email: 'admin@lumina.com',
          phone: '09120000001',
          passwordHash,
          roles: ['OWNER', 'ADMIN'],
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          headline: 'مدیر سیستم و نظارت بر محتوا',
          bio: 'مدیریت و پشتیبانی پلتفرم لومینا.',
          walletBalance: 0,
          subscriptionPlanId: undefined,
          subscriptionStartDate: undefined,
          subscriptionEndDate: undefined,
          subscriptionStatus: undefined,
          isVip: false,
          isEmailVerified: true,
          isPhoneVerified: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        preservedUsers.push(adminAccount);
      }

      // Wipe courses, enrollments, progress, notes, reviews, orders, payments, digitalProducts, coupons
      db.courses = [];
      db.digitalProducts = [];
      db.enrollments = [];
      db.lessonProgress = [];
      db.courseProgress = [];
      db.lessonNotes = [];
      db.reviews = [];
      db.coupons = [];
      db.orders = [];
      db.payments = [];
      db.paymentTransactions = [];
      db.users = preservedUsers;

      // Persist to disk
      db.saveSnapshotSync();

      res.json({
        success: true,
        message: 'تمامی دوره‌های تستی، کاربران دمو و ثبت‌نام‌ها با موفقیت پاکسازی شدند. حساب کاربری مدیر ارشد (admin@lumina.com)، ساختار نقش‌ها و تنظیمات ظاهر سایت (CMS) دست‌نخورده باقی ماندند.',
        stats: {
          wipedCourses: initialCoursesCount,
          wipedEnrollments: initialEnrollmentsCount,
          wipedReviews: initialReviewsCount,
          wipedOrders: initialOrdersCount,
          wipedStudents: initialUsersCount - preservedUsers.length,
          remainingUsers: preservedUsers.length,
          retainedAdmin: 'admin@lumina.com'
        }
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
