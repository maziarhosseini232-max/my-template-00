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
    driver: 'local', // 'local' | 's3' | 'r2'
    localUploadDir: 'uploads',
  }
};
