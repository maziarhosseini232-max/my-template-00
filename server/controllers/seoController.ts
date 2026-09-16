import { Request, Response, NextFunction } from 'express';
import { seoService } from '../services/seoService.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class SeoController {
  async getEntitySeo(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, id } = req.params;
      const seo = await seoService.getSeoForEntity(type.toUpperCase(), id);
      res.json({ success: true, data: seo });
    } catch (error: any) {
      next(error);
    }
  }

  async updateEntitySeo(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updated = await seoService.updateSeoMetadata(req.body);
      res.json({ success: true, message: 'متادیتای سئو ذخیره شد.', data: updated });
    } catch (error: any) {
      next(error);
    }
  }

  getSitemap(req: Request, res: Response) {
    const hostUrl = process.env.SITE_URL || process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const xml = seoService.generateSitemapXml(hostUrl);
    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.send(xml);
  }

  getRobots(req: Request, res: Response) {
    const hostUrl = process.env.SITE_URL || process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const robots = seoService.generateRobotsTxt(hostUrl);
    res.header('Content-Type', 'text/plain; charset=utf-8');
    res.send(robots);
  }
}

export const seoController = new SeoController();
