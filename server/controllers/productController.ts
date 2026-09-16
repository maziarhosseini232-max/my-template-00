import { Request, Response, NextFunction } from 'express';
import { storageService } from '../services/storageService.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class ProductController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await storageService.getAllProducts();
      res.json({ success: true, count: products.length, data: products });
    } catch (error: any) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await storageService.getProductById(req.params.id);
      res.json({ success: true, data: product });
    } catch (error: any) {
      next(error);
    }
  }

  async requestDownload(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId || 'guest';
      const access = await storageService.getDownloadAccess(userId, req.params.id);
      res.json({
        success: true,
        message: 'لینک دانلود امن ایجاد گردید.',
        data: access
      });
    } catch (error: any) {
      next(error);
    }
  }

  async downloadFile(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.query.token as string;
      if (!token) {
        res.status(400).json({ success: false, message: 'توکن دانلود الزامی است.' });
        return;
      }

      const storageKey = await storageService.verifyDownloadToken(token);
      res.json({
        success: true,
        message: 'دسترسی به فایل با موفقیت احراز شد.',
        storageKey,
        demoFileContent: 'Lumina Learn Secure Binary Payload for ' + storageKey
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export const productController = new ProductController();
