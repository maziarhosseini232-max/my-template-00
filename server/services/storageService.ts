import { db } from '../db/index.js';
import { DigitalProduct, DigitalProductType } from '../db/schema.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

import path from 'path';

export interface StorageProvider {
  getSignedDownloadUrl(storageKey: string, expiresInMinutes: number): Promise<string>;
  upload(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<{ storageKey: string; size: string }>;
  delete(storageKey: string): Promise<boolean>;
}

const MAX_UPLOAD_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
const DANGEROUS_EXTENSIONS = ['.exe', '.dll', '.bat', '.cmd', '.sh', '.php', '.phtml', '.vbs', '.msi', '.scr', '.jar', '.com'];

export class LocalSecureStorageProvider implements StorageProvider {
  async getSignedDownloadUrl(storageKey: string, expiresInMinutes = 60): Promise<string> {
    // Generate secure time-limited token
    const token = jwt.sign(
      { storageKey, exp: Math.floor(Date.now() / 1000) + expiresInMinutes * 60 },
      config.jwtSecret
    );
    return `/api/files/download?token=${token}`;
  }

  async upload(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<{ storageKey: string; size: string }> {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error('فایل بارگذاری شده خالی است.');
    }
    if (fileBuffer.length > MAX_UPLOAD_SIZE_BYTES) {
      throw new Error('حجم فایل فراتر از سقف مجاز ۵۰ مگابایت است.');
    }

    const sanitizedBase = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = path.extname(sanitizedBase).toLowerCase();
    if (DANGEROUS_EXTENSIONS.includes(ext)) {
      throw new Error(`بارگذاری فایل با پسوند ${ext} به دلایل امنیتی مسدود است.`);
    }

    const storageKey = `uploads/${Date.now()}_${sanitizedBase}`;
    const sizeInMb = (fileBuffer.length / (1024 * 1024)).toFixed(2) + ' MB';
    return { storageKey, size: sizeInMb };
  }

  async delete(storageKey: string): Promise<boolean> {
    return true;
  }
}

export class StorageService {
  private provider: StorageProvider;

  constructor() {
    this.provider = new LocalSecureStorageProvider();
  }

  async getAllProducts() {
    return db.digitalProducts;
  }

  async getProductById(id: string) {
    const product = db.digitalProducts.find(p => p.id === id || p.slug === id);
    if (!product) throw new Error('محصول دیجیتال یافت نشد.');
    return product;
  }

  async getDownloadAccess(userId: string, productId: string) {
    const product = await this.getProductById(productId);
    
    // In Phase 1, all products/files are free or accessible upon request
    product.downloadCount += 1;
    const downloadUrl = await this.provider.getSignedDownloadUrl(product.storageKey, 120);

    return {
      title: product.title,
      fileType: product.fileType,
      fileSize: product.fileSize,
      downloadUrl,
      expiresInMinutes: 120
    };
  }

  async uploadFile(fileName: string, mimeType: string, fileBuffer: Buffer, userId?: string) {
    return this.provider.upload(fileBuffer, fileName, mimeType);
  }

  async verifyDownloadToken(token: string) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as { storageKey: string };
      return decoded.storageKey;
    } catch {
      throw new Error('لینک دانلود منقضی شده یا نامعتبر است.');
    }
  }
}

export const storageService = new StorageService();
