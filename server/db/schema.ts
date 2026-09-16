export type UserRoleType = 'OWNER' | 'ADMIN' | 'INSTRUCTOR' | 'EDITOR' | 'SUPPORT' | 'STUDENT';

export type CourseStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';
export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVELS';
export type LessonContentType = 'VIDEO' | 'AUDIO' | 'TEXT' | 'PDF' | 'RESOURCE' | 'EXTERNAL';
export type DigitalProductType = 'PDF' | 'ZIP' | 'DOC' | 'XLS' | 'PSD' | 'AI' | 'AUDIO' | 'VIDEO' | 'IMAGE' | 'OTHER';

export interface Permission {
  id: string;
  name: string; // e.g. 'course:create', 'course:publish', 'settings:update'
  description: string;
  module: string;
}

export interface Role {
  id: string;
  name: UserRoleType;
  description: string;
  permissions: string[]; // Permission names
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  roles: UserRoleType[];
  avatar?: string;
  headline?: string;
  bio?: string;
  shebaNumber?: string;
  enrolledCourseIds?: string[];
  subscriptionEndDate?: string | null;
  walletBalance: number;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface SeoMetadata {
  id: string;
  entityType: 'COURSE' | 'CATEGORY' | 'INSTRUCTOR' | 'PAGE' | 'BLOG' | 'PRODUCT';
  entityId: string;
  title: string;
  description: string;
  canonical?: string;
  robots?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  keywords?: string[];
  structuredData?: Record<string, any>;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  description?: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface InstructorProfile {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  title: string;
  bio: string;
  specialties: string[];
  experienceYears: number;
  rating: number;
  studentsCount: number;
  coursesCount: number;
  socialLinks?: {
    website?: string;
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LessonResource {
  id: string;
  lessonId: string;
  title: string;
  fileType: DigitalProductType;
  fileSize: string;
  storageKey: string; // Secure path/key, not public URL
  downloadUrl?: string; // Tokenized or computed
  isPublic: boolean;
  createdAt: string;
}

export interface CourseLesson {
  id: string;
  sectionId: string;
  courseId: string;
  title: string;
  description?: string;
  contentType: LessonContentType;
  durationMinutes: number;
  videoUrl?: string;
  audioUrl?: string;
  textContent?: string;
  pdfUrl?: string;
  externalUrl?: string;
  isFreePreview: boolean;
  orderIndex: number;
  resources: LessonResource[];
  createdAt: string;
  updatedAt: string;
}

export interface CourseSection {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  lessons: CourseLesson[];
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  thumbnail: string;
  videoPreviewUrl?: string;
  instructorId: string;
  categoryId: string;
  tagIds: string[];
  level: CourseLevel;
  durationHours: number;
  language: string;
  status: CourseStatus;
  isFree: boolean;
  isVip?: boolean; // نیازمند اشتراک ویژه (VIP)
  requiresSubscription?: boolean; // معادل isVip جهت هماهنگی با ماژول‌های قبلی
  accessType?: 'FREE' | 'VIP' | 'PAID';
  // فیلدهای قیمت‌گذاری تکی (غیرفعال/اختیاری شده جهت سازگاری)
  price?: number;
  originalPrice?: number;
  salePrice?: number;
  discountPrice?: number;
  discountPercentage?: number;
  currency?: string;
  saleStart?: string;
  saleEnd?: string;
  isSaleEnabled?: boolean;
  prerequisites: string[];
  whatYouWillLearn: string[];
  rating: number;
  reviewsCount: number;
  enrolledStudentsCount: number;
  sections: CourseSection[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface DigitalProduct {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  thumbnail: string;
  fileType: DigitalProductType;
  fileSize: string;
  storageKey: string;
  version: string;
  isFree: boolean;
  price: number;
  discountPrice?: number;
  downloadCount: number;
  associatedCourseId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  accessType: 'FREE' | 'PAID' | 'SUBSCRIPTION' | 'GIFT';
  enrolledAt: string;
  expiresAt?: string | null;
  isActive: boolean;
  lastLessonId?: string;
  lastPositionSeconds?: number;
  completedLessonIds?: string[];
  isArchived?: boolean;
  updatedAt?: string;
}

export interface LessonProgress {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  isCompleted: boolean;
  lastPositionSeconds: number;
  timeSpentSeconds: number;
  completedAt?: string | null;
  updatedAt: string;
}

export interface CourseProgress {
  id: string;
  userId: string;
  courseId: string;
  progressPercent: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  lastWatchedLessonId?: string;
  isCompleted: boolean;
  completedAt?: string | null;
  certificateIssued: boolean;
  certificateId?: string;
  updatedAt: string;
}

export interface LessonNote {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  timestampSeconds: number;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

export interface HomepageSection {
  id: string;
  sectionType: 'Hero' | 'FeaturedCourses' | 'Categories' | 'FreeResources' | 'Instructors' | 'Testimonials' | 'FAQ' | 'CTA' | 'Banner' | 'Blog' | 'Newsletter' | 'Custom';
  title: string;
  subtitle?: string;
  orderIndex: number;
  isEnabled: boolean;
  content: Record<string, any>;
  styleConfig?: Record<string, any>;
  updatedAt: string;
}

export interface SiteSetting {
  id: string;
  siteName: string;
  siteNameEn: string;
  tagline: string;
  heroSubtitle?: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  defaultLanguage: 'fa' | 'en';
  isRtl: boolean;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialLinks: {
    instagram?: string;
    telegram?: string;
    linkedin?: string;
    youtube?: string;
    twitter?: string;
  };
  footerText: string;
  copyrightText: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: string;
  buttonStyle?: string;
  isInstructorRegistrationEnabled?: boolean;
  isAlacarteSaleEnabled?: boolean;
  paymentGatewayMode?: 'MOCK_GATEWAY' | 'ZARINPAL';
  zarinpalMerchantId?: string;
  zarinpalSandbox?: boolean;
  updatedAt: string;
}

export interface NavigationItem {
  id: string;
  menuLocation: 'HEADER_MAIN' | 'FOOTER_COLUMN_1' | 'FOOTER_COLUMN_2' | 'FOOTER_COLUMN_3' | 'MOBILE_BOTTOM';
  label: string;
  labelEn?: string;
  url: string;
  icon?: string;
  parentId?: string | null;
  orderIndex: number;
  isEnabled: boolean;
  targetBlank: boolean;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string;
  authorId: string;
  authorName: string;
  categoryId: string;
  tags: string[];
  readTimeMinutes: number;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  action: string; // 'CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'UNPUBLISH', 'ROLE_CHANGE', 'LOGIN', etc.
  entity: string; // 'COURSE', 'LESSON', 'USER', 'SETTINGS', 'HOMEPAGE_SECTION', 'NAVIGATION'
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  changes?: Record<string, any>;
  createdAt: string;
}

// ----------------------------------------------------
// Commerce & Order Architecture
// ----------------------------------------------------

export type OrderStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type PaymentGatewayType = 'MOCK_GATEWAY' | 'SHAPARAK' | 'ZARINPAL' | 'WALLET';

export interface OrderItem {
  courseId?: string;
  subscriptionPlanId?: string;
  durationInMonths?: 1 | 3 | 6 | 9;
  title: string;
  price: number;
  originalPrice: number;
  instructorId?: string;
  instructorName?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  type?: 'SUBSCRIPTION' | 'COURSE';
  subscriptionPlanId?: string;
  durationInMonths?: 1 | 3 | 6 | 9;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  couponCode?: string;
  status: OrderStatus;
  paymentMethod: 'gateway' | 'wallet' | 'card';
  paymentGateway: PaymentGatewayType;
  trackingCode?: string;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  gateway: PaymentGatewayType;
  transactionId: string;
  trackingCode: string;
  status: PaymentStatus;
  cardPanMasked?: string;
  paidAt?: string | null;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  title: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number; // percentage (e.g. 50) or fixed toman (e.g. 200000)
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  applicableCourseIds?: string[]; // empty means all
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransaction {
  id: string;
  orderId?: string;
  userId: string;
  type: 'PAYMENT' | 'REFUND' | 'PAYOUT' | 'COMMISSION';
  amount: number;
  currency: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  description: string;
  referenceNumber: string;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  title: string;
  durationInMonths: 1 | 3 | 6 | 9;
  price: number; // Toman
  discountedPrice?: number; // Toman
  features?: string[];
  isPopular?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}


