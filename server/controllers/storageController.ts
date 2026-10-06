import { Request, Response } from 'express';
import { storageService } from '../services/storageService.js';
import { config } from '../config/index.js';

export const storageController = {
  async getStatus(req: Request, res: Response) {
    const s3 = config.storage.s3;
    const accessKeyMasked = s3.accessKey 
      ? `${s3.accessKey.substring(0, 4)}••••${s3.accessKey.substring(s3.accessKey.length - 3)}` 
      : 'ثبت نشده';

    res.json({
      success: true,
      data: {
        driver: storageService.getActiveDriver(),
        provider: 'پارس‌پک ابری (ParsPack Cloud S3)',
        endpoint: s3.endpoint,
        bucket: s3.bucket,
        accessKeyMasked,
        region: s3.region,
        publicUrlPrefix: s3.publicUrlPrefix,
        maxUploadSize: '500 MB',
        isConfigured: Boolean(s3.endpoint && s3.accessKey && s3.secretKey && s3.bucket)
      }
    });
  },

  async testConnection(req: Request, res: Response) {
    try {
      const result = await storageService.testConnection();
      res.json({
        success: result.success,
        data: result,
        message: result.message
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'خطا در برقراری ارتباط با فضای ذخیره‌سازی ابری.'
      });
    }
  },

  async upload(req: Request, res: Response) {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'هیچ فایلی برای بارگذاری ارسال نشده است.'
        });
      }

      const folder = (req.body.folder as string) || 'courses';
      const userId = (req as any).user?.id || 'admin';

      const uploadResult = await storageService.uploadFile(
        file.originalname,
        file.mimetype,
        file.buffer,
        userId,
        folder
      );

      res.json({
        success: true,
        message: 'فایل با موفقیت در فضای ابری پارس‌پک ذخیره شد.',
        data: {
          name: file.originalname,
          key: uploadResult.storageKey,
          url: uploadResult.publicUrl,
          size: uploadResult.size,
          mimeType: file.mimetype,
          isS3: uploadResult.isS3,
          s3Url: (uploadResult as any).s3Url,
          s3StorageKey: (uploadResult as any).s3StorageKey
        }
      });
    } catch (err: any) {
      console.error('[StorageController Upload Error]:', err.message);
      res.status(400).json({
        success: false,
        message: err.message || 'خطا در بارگذاری فایل در فضای ابری.'
      });
    }
  },

  async getPresignedUploadUrl(req: Request, res: Response) {
    try {
      const { fileName, mimeType, folder } = req.body;
      if (!fileName) {
        return res.status(400).json({
          success: false,
          message: 'نام فایل الزامی است.'
        });
      }

      const result = await storageService.getSignedUploadUrl(
        fileName,
        mimeType || 'application/octet-stream',
        folder || 'videos'
      );

      res.json({
        success: true,
        data: result
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'خطا در صدور مجوز بارگذاری مستقیم در فضای ابری.'
      });
    }
  },

  async listFiles(req: Request, res: Response) {
    try {
      const prefix = (req.query.prefix as string) || '';
      const files = await storageService.listFiles(prefix);
      res.json({
        success: true,
        data: files,
        count: files.length
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'خطا در واکشی فهرست فایل‌های فضای ابری.'
      });
    }
  },

  async deleteFile(req: Request, res: Response) {
    try {
      const key = (req.query.key as string) || (req.body.key as string);
      if (!key) {
        return res.status(400).json({
          success: false,
          message: 'شناسه فایل (Storage Key) مشخص نشده است.'
        });
      }

      const success = await storageService.deleteFile(key);
      res.json({
        success,
        message: success ? 'فایل از فضای ابری حذف گردید.' : 'فایل یافت نشد یا عملیات حذف با خطا مواجه شد.'
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'خطا در حذف فایل از فضای ابری.'
      });
    }
  },

  async updateConfig(req: Request, res: Response) {
    try {
      const { endpoint, accessKey, secretKey, bucket, region, driver, publicUrlPrefix } = req.body;
      
      if (endpoint || accessKey || secretKey || bucket) {
        storageService.reconfigureS3({
          endpoint,
          accessKey,
          secretKey,
          bucket,
          region,
          publicUrlPrefix
        });
      }

      if (driver && (driver === 's3' || driver === 'local')) {
        storageService.setDriver(driver);
      }

      // Test new connection immediately
      const testResult = await storageService.testConnection();

      res.json({
        success: true,
        message: 'تنظیمات فضای ابری با موفقیت به‌روزرسانی شد.',
        testResult
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'خطا در ثبت تنظیمات جدید فضای ابری.'
      });
    }
  }
};
