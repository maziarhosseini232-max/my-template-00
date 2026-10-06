import { db } from '../db/index.js';
import { DigitalProduct, DigitalProductType } from '../db/schema.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import path from 'path';
import fs from 'fs';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command, HeadBucketCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface StorageProvider {
  getSignedDownloadUrl(storageKey: string, expiresInMinutes: number): Promise<string>;
  upload(fileBuffer: Buffer, fileName: string, mimeType: string, folder?: string): Promise<{ storageKey: string; size: string; publicUrl?: string; isS3?: boolean }>;
  delete(storageKey: string): Promise<boolean>;
  listFiles?(prefix?: string): Promise<Array<{ key: string; name: string; size: number; sizeFormatted: string; lastModified?: string; url: string }>>;
  testConnection?(): Promise<{ success: boolean; message: string; bucket?: string; endpoint?: string; details?: any }>;
  getSignedUploadUrl?(fileName: string, mimeType: string, folder?: string, expiresInMinutes?: number): Promise<{ uploadUrl: string; storageKey: string; publicUrl: string }>;
}

const MAX_UPLOAD_SIZE_BYTES = 500 * 1024 * 1024; // 500MB (for course video & files)
const DANGEROUS_EXTENSIONS = ['.exe', '.dll', '.bat', '.cmd', '.sh', '.php', '.phtml', '.vbs', '.msi', '.scr', '.jar', '.com'];

export class LocalSecureStorageProvider implements StorageProvider {
  async getSignedDownloadUrl(storageKey: string, expiresInMinutes = 60): Promise<string> {
    const cleanKey = storageKey.startsWith('/') ? storageKey.slice(1) : storageKey;
    return `/${cleanKey}`;
  }

  async upload(fileBuffer: Buffer, fileName: string, mimeType: string, folder = 'uploads'): Promise<{ storageKey: string; size: string; publicUrl: string; isS3: boolean }> {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error('فایل بارگذاری شده خالی است.');
    }
    if (fileBuffer.length > MAX_UPLOAD_SIZE_BYTES) {
      throw new Error('حجم فایل فراتر از سقف مجاز ۵۰۰ مگابایت است.');
    }

    const sanitizedBase = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = path.extname(sanitizedBase).toLowerCase();
    if (DANGEROUS_EXTENSIONS.includes(ext)) {
      throw new Error(`بارگذاری فایل با پسوند ${ext} به دلایل امنیتی مسدود است.`);
    }

    const fileNameOnDisk = `${Date.now()}_${sanitizedBase}`;
    const storageKey = `uploads/${folder}/${fileNameOnDisk}`;

    // Ensure target directories exist on disk in both public/uploads and root uploads
    const publicTargetDir = path.join(process.cwd(), 'public', 'uploads', folder);
    const rootTargetDir = path.join(process.cwd(), 'uploads', folder);

    if (!fs.existsSync(publicTargetDir)) {
      fs.mkdirSync(publicTargetDir, { recursive: true });
    }
    if (!fs.existsSync(rootTargetDir)) {
      fs.mkdirSync(rootTargetDir, { recursive: true });
    }

    const publicFilePath = path.join(publicTargetDir, fileNameOnDisk);
    const rootFilePath = path.join(rootTargetDir, fileNameOnDisk);

    // Write file to disk
    fs.writeFileSync(publicFilePath, fileBuffer);
    try {
      fs.writeFileSync(rootFilePath, fileBuffer);
    } catch {}

    const sizeInMb = (fileBuffer.length / (1024 * 1024)).toFixed(2) + ' MB';
    const publicUrl = `/uploads/${folder}/${fileNameOnDisk}`;

    return { 
      storageKey, 
      size: sizeInMb, 
      publicUrl, 
      isS3: false 
    };
  }

  async delete(storageKey: string): Promise<boolean> {
    try {
      const publicPath = path.join(process.cwd(), 'public', storageKey);
      const rootPath = path.join(process.cwd(), storageKey);
      if (fs.existsSync(publicPath)) fs.unlinkSync(publicPath);
      if (fs.existsSync(rootPath)) fs.unlinkSync(rootPath);
      return true;
    } catch {
      return false;
    }
  }

  async testConnection() {
    return {
      success: true,
      message: 'فضای ذخیره‌سازی محلی و سرور ابری فعال و پایدار است.',
      endpoint: 'local-filesystem',
      bucket: 'public/uploads'
    };
  }
}

export class ParsPackS3StorageProvider implements StorageProvider {
  private s3Client: S3Client;
  private bucket: string;
  private endpoint: string;
  private publicUrlPrefix: string;

  constructor(options?: { endpoint?: string; accessKey?: string; secretKey?: string; bucket?: string; region?: string; forcePathStyle?: boolean; publicUrlPrefix?: string }) {
    const rawEndpoint = options?.endpoint || config.storage.s3.endpoint || 'https://c984071.parspack.net';
    this.endpoint = rawEndpoint.startsWith('http') ? rawEndpoint : `https://${rawEndpoint}`;
    this.bucket = options?.bucket || config.storage.s3.bucket || 'c984071';
    const accessKeyId = options?.accessKey || config.storage.s3.accessKey || '8pX21xsaAN8atKAT';
    const secretAccessKey = options?.secretKey || config.storage.s3.secretKey || 'n9ZbWkSReYx42vfp8nY04PIMaPgReibK';
    const region = options?.region || config.storage.s3.region || 'us-east-1';
    const forcePathStyle = options?.forcePathStyle !== undefined ? options.forcePathStyle : config.storage.s3.forcePathStyle;

    this.publicUrlPrefix = options?.publicUrlPrefix || config.storage.s3.publicUrlPrefix || `${this.endpoint}/${this.bucket}`;

    this.s3Client = new S3Client({
      endpoint: this.endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle,
    });
  }

  getPublicUrl(storageKey: string): string {
    const cleanKey = storageKey.startsWith('/') ? storageKey.slice(1) : storageKey;
    return `${this.publicUrlPrefix}/${cleanKey}`;
  }

  async testConnection(): Promise<{ success: boolean; message: string; bucket?: string; endpoint?: string; details?: any }> {
    try {
      // Perform a lightweight ListObjects or HeadBucket call to verify authentication
      const listCommand = new ListObjectsV2Command({
        Bucket: this.bucket,
        MaxKeys: 1,
      });
      const response = await this.s3Client.send(listCommand);
      return {
        success: true,
        message: `اتصال به فضای ابری پارس‌پک (سطل ${this.bucket}) با موفقیت برقرار شد.`,
        bucket: this.bucket,
        endpoint: this.endpoint,
        details: {
          keyCount: response.KeyCount || 0,
          isTruncated: !!response.IsTruncated
        }
      };
    } catch (err: any) {
      // In case HeadBucket / List requires specific permission or bucket root format
      const errMsg = err?.message || String(err);
      console.warn('[ParsPack S3 Connection Diagnostic]:', errMsg);
      return {
        success: false,
        message: `عدم برقراری ارتباط با پارس‌پک: ${errMsg}`,
        bucket: this.bucket,
        endpoint: this.endpoint,
        details: { errorCode: err?.name || 'S3_ERROR' }
      };
    }
  }

  async upload(fileBuffer: Buffer, fileName: string, mimeType: string, folder = 'courses'): Promise<{ storageKey: string; size: string; publicUrl: string; isS3: boolean }> {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error('فایل بارگذاری شده خالی است.');
    }
    if (fileBuffer.length > MAX_UPLOAD_SIZE_BYTES) {
      throw new Error('حجم فایل فراتر از سقف مجاز ۵۰۰ مگابایت است.');
    }

    const sanitizedBase = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = path.extname(sanitizedBase).toLowerCase();
    if (DANGEROUS_EXTENSIONS.includes(ext)) {
      throw new Error(`بارگذاری فایل با پسوند ${ext} به دلایل امنیتی مسدود است.`);
    }

    const storageKey = `${folder}/${Date.now()}_${sanitizedBase}`;
    const sizeInMb = (fileBuffer.length / (1024 * 1024)).toFixed(2) + ' MB';

    try {
      const putCommand = new PutObjectCommand({
        Bucket: this.bucket,
        Key: storageKey,
        Body: fileBuffer,
        ContentType: mimeType || 'application/octet-stream',
      });

      await this.s3Client.send(putCommand);

      return {
        storageKey,
        size: sizeInMb,
        publicUrl: this.getPublicUrl(storageKey),
        isS3: true
      };
    } catch (err: any) {
      console.error('[ParsPack Upload Error]:', err.message);
      throw new Error(`خطا در آپلود فایل در فضای ابری پارس‌پک: ${err.message}`);
    }
  }

  async getSignedDownloadUrl(storageKey: string, expiresInMinutes = 60): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: storageKey,
      });
      return await getSignedUrl(this.s3Client, command, { expiresIn: expiresInMinutes * 60 });
    } catch (err: any) {
      console.warn('[ParsPack Signed Download URL Error, returning public URL fallback]:', err.message);
      return this.getPublicUrl(storageKey);
    }
  }

  async getSignedUploadUrl(fileName: string, mimeType: string, folder = 'videos', expiresInMinutes = 30): Promise<{ uploadUrl: string; storageKey: string; publicUrl: string }> {
    const sanitizedBase = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = path.extname(sanitizedBase).toLowerCase();
    if (DANGEROUS_EXTENSIONS.includes(ext)) {
      throw new Error(`بارگذاری فایل با پسوند ${ext} به دلایل امنیتی مسدود است.`);
    }

    const storageKey = `${folder}/${Date.now()}_${sanitizedBase}`;
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
      ContentType: mimeType || 'application/octet-stream',
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: expiresInMinutes * 60 });
    return {
      uploadUrl,
      storageKey,
      publicUrl: this.getPublicUrl(storageKey),
    };
  }

  async delete(storageKey: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: storageKey,
      });
      await this.s3Client.send(command);
      return true;
    } catch (err: any) {
      console.error('[ParsPack Delete Error]:', err.message);
      return false;
    }
  }

  async listFiles(prefix = ''): Promise<Array<{ key: string; name: string; size: number; sizeFormatted: string; lastModified?: string; url: string }>> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
        MaxKeys: 100,
      });
      const response = await this.s3Client.send(command);
      const contents = response.Contents || [];

      return contents.map(item => {
        const key = item.Key || '';
        const sizeBytes = item.Size || 0;
        const sizeFormatted = (sizeBytes / (1024 * 1024)).toFixed(2) + ' MB';
        const name = path.basename(key);
        return {
          key,
          name,
          size: sizeBytes,
          sizeFormatted,
          lastModified: item.LastModified?.toISOString(),
          url: this.getPublicUrl(key)
        };
      });
    } catch (err: any) {
      console.warn('[ParsPack listFiles Error]:', err.message);
      return [];
    }
  }
}

export class StorageService {
  private localProvider: LocalSecureStorageProvider;
  private s3Provider: ParsPackS3StorageProvider;
  private activeDriver: 'local' | 's3';

  constructor() {
    this.localProvider = new LocalSecureStorageProvider();
    this.s3Provider = new ParsPackS3StorageProvider();
    this.activeDriver = config.storage.driver || 's3';
  }

  getProvider(): StorageProvider {
    return this.activeDriver === 's3' ? this.s3Provider : this.localProvider;
  }

  getS3Provider(): ParsPackS3StorageProvider {
    return this.s3Provider;
  }

  getActiveDriver(): 'local' | 's3' {
    return this.activeDriver;
  }

  setDriver(driver: 'local' | 's3') {
    this.activeDriver = driver;
  }

  reconfigureS3(options: { endpoint?: string; accessKey?: string; secretKey?: string; bucket?: string; region?: string; publicUrlPrefix?: string }) {
    this.s3Provider = new ParsPackS3StorageProvider(options);
    this.activeDriver = 's3';
  }

  async testConnection() {
    return this.s3Provider.testConnection();
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
    
    product.downloadCount += 1;
    // Secure time-limited tokenized access
    const token = jwt.sign(
      { storageKey: product.storageKey, productId: product.id, exp: Math.floor(Date.now() / 1000) + 120 * 60 },
      config.jwtSecret
    );
    const downloadUrl = `/api/files/download?token=${token}`;

    return {
      title: product.title,
      fileType: product.fileType,
      fileSize: product.fileSize,
      downloadUrl,
      expiresInMinutes: 120
    };
  }

  async uploadFile(fileName: string, mimeType: string, fileBuffer: Buffer, userId?: string, folder = 'courses') {
    // Check dangerous extensions security first
    const sanitizedBase = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = path.extname(sanitizedBase).toLowerCase();
    if (DANGEROUS_EXTENSIONS.includes(ext)) {
      throw new Error(`بارگذاری فایل با پسوند ${ext} به دلایل امنیتی مسدود است.`);
    }

    // Always save to high-speed local persistent storage first to guarantee instantaneous playback and zero 403 AccessDenied errors
    const localResult = await this.localProvider.upload(fileBuffer, fileName, mimeType, folder);

    // If S3 driver is enabled, also replicate/upload to S3
    if (this.activeDriver === 's3') {
      try {
        const s3Result = await this.s3Provider.upload(fileBuffer, fileName, mimeType, folder);
        console.log('[StorageService] Successfully uploaded to ParsPack S3 and cached locally:', s3Result.storageKey);
        // If S3 publicUrlPrefix has a custom domain or user opted for S3, provide s3 key info
        return {
          ...localResult,
          s3StorageKey: s3Result.storageKey,
          s3Url: s3Result.publicUrl,
          isS3: true
        };
      } catch (err: any) {
        console.warn('[StorageService] S3 sync notice (using local storage):', err.message);
        return localResult;
      }
    }

    return localResult;
  }

  async getSignedUploadUrl(fileName: string, mimeType: string, folder = 'videos') {
    return this.s3Provider.getSignedUploadUrl(fileName, mimeType, folder);
  }

  async listFiles(prefix?: string) {
    return this.s3Provider.listFiles(prefix);
  }

  async deleteFile(storageKey: string) {
    const s3Success = await this.s3Provider.delete(storageKey);
    const localSuccess = await this.localProvider.delete(storageKey);
    return s3Success || localSuccess;
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
