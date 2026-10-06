import 'dotenv/config';

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && !process.env.JWT_SECRET) {
  console.warn('⚠️ [SECURITY NOTICE]: JWT_SECRET is not set in environment variables. Using fallback secret. For maximum production security, set JWT_SECRET in .env.');
}

export const config = {
  port: 3000,
  jwtSecret: process.env.JWT_SECRET || (isProduction ? 'lumina-learn-production-fallback-secret-2026' : 'lumina-learn-dev-secret-key-2026-production-ready'),
  jwtExpiresIn: '7d',
  env: process.env.NODE_ENV || 'development',
  siteUrl: process.env.SITE_URL || process.env.APP_URL || 'http://localhost:3000',
  allowedOrigins: process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
    : (process.env.CLIENT_URL ? [process.env.CLIENT_URL.trim()] : []),
  zarinpal: {
    merchantId: process.env.ZARINPAL_MERCHANT_ID || '00000000-0000-0000-0000-000000000000',
    sandbox: process.env.ZARINPAL_SANDBOX !== 'false',
  },
  storage: {
    driver: (process.env.STORAGE_DRIVER as 'local' | 's3') || 's3',
    localUploadDir: 'uploads',
    s3: {
      endpoint: (process.env.S3_ENDPOINT || 'https://c984071.parspack.net').replace(/^S3_ENDPOINT=/, '').trim(),
      accessKey: (process.env.S3_ACCESS_KEY || '8pX21xsaAN8atKAT').replace(/^S3_ACCESS_KEY=/, '').trim(),
      secretKey: (process.env.S3_SECRET_KEY || 'n9ZbWkSReYx42vfp8nY04PIMaPgReibK').replace(/^S3_SECRET_KEY=/, '').trim(),
      bucket: (process.env.S3_BUCKET || 'c984071').replace(/^S3_BUCKET=/, '').trim(),
      region: (process.env.S3_REGION || 'us-east-1').replace(/^S3_REGION=/, '').trim(),
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
      publicUrlPrefix: (process.env.S3_PUBLIC_URL_PREFIX || 'https://c984071.parspack.net').replace(/^S3_PUBLIC_URL_PREFIX=/, '').trim(),
    }
  }
};

