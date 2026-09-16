import { Request, Response, NextFunction } from 'express';
import { cmsService } from '../services/cmsService.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class CmsController {
  // Homepage Sections (Site Builder)
  async getHomepageSections(req: Request, res: Response, next: NextFunction) {
    try {
      const sections = await cmsService.getHomepageSections();
      res.json({ success: true, count: sections.length, data: sections });
    } catch (error: any) {
      next(error);
    }
  }

  async updateHomepageSection(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updated = await cmsService.updateHomepageSection(req.params.id, req.body);
      res.json({ success: true, message: 'سکشن با موفقیت ویرایش شد.', data: updated });
    } catch (error: any) {
      next(error);
    }
  }

  async reorderHomepageSections(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { sectionIds } = req.body;
      const reordered = await cmsService.reorderHomepageSections(sectionIds);
      res.json({ success: true, message: 'ترتیب بخش‌ها به‌روزرسانی شد.', data: reordered });
    } catch (error: any) {
      next(error);
    }
  }

  async addHomepageSection(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const newSec = await cmsService.addCustomHomepageSection(req.body);
      res.status(201).json({ success: true, message: 'سکشن جدید ایجاد گردید.', data: newSec });
    } catch (error: any) {
      next(error);
    }
  }

  async deleteHomepageSection(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await cmsService.deleteHomepageSection(req.params.id);
      res.json({ success: true, message: result.message });
    } catch (error: any) {
      next(error);
    }
  }

  // Site Settings
  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await cmsService.getSiteSettings();
      res.json({ success: true, data: settings });
    } catch (error: any) {
      next(error);
    }
  }

  async updateSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updated = await cmsService.updateSiteSettings(req.body);
      res.json({ success: true, message: 'تنظیمات با موفقیت ذخیره شد.', data: updated });
    } catch (error: any) {
      next(error);
    }
  }

  // Navigation CMS
  async getNavigation(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await cmsService.getNavigationItems(req.query.location as string);
      res.json({ success: true, count: items.length, data: items });
    } catch (error: any) {
      next(error);
    }
  }

  async addNavigationItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const item = await cmsService.addNavigationItem(req.body);
      res.status(201).json({ success: true, message: 'آیتم به منو افزوده شد.', data: item });
    } catch (error: any) {
      next(error);
    }
  }

  async updateNavigationItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const item = await cmsService.updateNavigationItem(req.params.id, req.body);
      res.json({ success: true, message: 'آیتم منو ویرایش شد.', data: item });
    } catch (error: any) {
      next(error);
    }
  }

  async deleteNavigationItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await cmsService.deleteNavigationItem(req.params.id);
      res.json({ success: true, message: result.message });
    } catch (error: any) {
      next(error);
    }
  }
}

export const cmsController = new CmsController();
