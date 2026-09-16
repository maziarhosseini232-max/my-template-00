export type UserRole = 'student' | 'instructor' | 'admin' | 'superadmin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar: string;
  role: UserRole;
  roles?: string[];
  headline?: string;
  bio?: string;
  shebaNumber?: string;
  joinedDate: string;
  walletBalance?: number;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  isActive?: boolean;
  subscriptionEndDate?: string | null;
  createdAt?: string;
  enrolledCourseIds: string[];
  wishlistCourseIds: string[];
  followedInstructorIds: string[];
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'deposit' | 'purchase' | 'refund' | 'bonus';
  amount: number;
  title: string;
  description?: string;
  trackingCode: string;
  gateway?: string;
  date: string;
  status: 'success' | 'pending' | 'failed';
}

export interface CourseDownloadItem {
  id: string;
  courseId: string;
  courseTitle: string;
  lessonTitle?: string;
  title: string;
  description?: string;
  fileSize: string;
  fileType: 'zip' | 'pdf' | 'figma' | 'code' | 'video' | 'doc' | 'audio';
  downloadUrl: string;
  downloadCount?: number;
  addedDate: string;
}

export interface InstructorApplication {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  phone: string;
  expertise: string;
  experienceYears: string;
  sampleUrl?: string;
  proposedTopic?: string;
  bio: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  submittedAt: string;
}

export type CourseLevel = 'All Levels' | 'Beginner' | 'Intermediate' | 'Advanced';

export interface CourseResource {
  id: string;
  title: string;
  fileSize: string;
  fileType: 'pdf' | 'zip' | 'figma' | 'code' | 'doc';
  downloadUrl: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  passingScore: number;
  questions: QuizQuestion[];
}

export type LessonContentType = 'video' | 'text' | 'pdf' | 'audio' | 'image' | 'code' | 'quote' | 'link' | 'quiz' | 'assignment' | 'download';

export interface LessonContentBlock {
  id: string;
  type: LessonContentType;
  title?: string;
  content: string; // text, code, url, embed or markdown
  caption?: string;
  meta?: {
    fileSize?: string;
    duration?: string;
    language?: string;
    author?: string;
    targetUrl?: string;
  };
}

export interface Lesson {
  id: string;
  title: string;
  durationMinutes: number;
  videoUrl: string;
  thumbnailUrl?: string;
  audioUrl?: string;
  pdfUrl?: string;
  textContent?: string;
  isPreviewFree?: boolean;
  description?: string;
  order?: number;
  resources?: CourseResource[];
  quiz?: Quiz;
  contentBlocks?: LessonContentBlock[];
  isPublished?: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  description?: string;
  order?: number;
  lessons: Lesson[];
  isExpanded?: boolean;
}

export interface CourseReview {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number; // 1 to 5
  date: string;
  comment: string;
  helpfulCount: number;
  isVerifiedPurchase: boolean;
  instructorResponse?: {
    date: string;
    comment: string;
  };
}

export type CourseStatus = 'draft' | 'pending' | 'published' | 'disabled' | 'archived';

export interface CourseSettings {
  isLifetimeAccess: boolean;
  requireSequentialCompletion: boolean;
  hasCertificate: boolean;
  enableDiscussions: boolean;
  allowDownloads: boolean;
  timeLimitDays?: number;
  freePreviewEnabled: boolean;
}

export interface CourseSeoSettings {
  metaTitle: string;
  metaDescription: string;
  slug: string;
  keywords: string[];
  ogImage?: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  type: 'video' | 'image' | 'pdf' | 'audio' | 'download';
  url: string;
  thumbnailUrl?: string;
  fileSize: string;
  sizeBytes?: number;
  duration?: string;
  resolution?: string;
  mimeType: string;
  createdAt: string;
  usedInCoursesCount?: number;
}

export interface UploadQueueItem {
  id: string;
  name: string;
  fileSize: string;
  type: 'video' | 'image' | 'pdf' | 'audio' | 'download';
  progress: number; // 0 to 100
  status: 'queued' | 'uploading' | 'processing' | 'ready' | 'error';
  errorMessage?: string;
  url?: string;
  thumbnailUrl?: string;
  duration?: string;
  resolution?: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  categoryId: string;
  categoryName: string;
  subCategory?: string;
  thumbnail: string;
  coverImage?: string;
  previewVideoUrl: string;
  instructorId: string;
  instructorName: string;
  instructorAvatar: string;
  instructorTitle: string;
  isVip?: boolean; // نیازمند اشتراک ویژه (VIP)
  requiresSubscription?: boolean; // معادل isVip
  accessType?: 'FREE' | 'VIP' | 'PAID';
  // فیلدهای قیمت‌گذاری تکی (اختیاری/غیرفعال)
  price?: number;
  originalPrice?: number;
  isFree?: boolean;
  salePrice?: number;
  discountPercentage?: number;
  currency?: string;
  saleStart?: string;
  saleEnd?: string;
  isSaleEnabled?: boolean;
  rating: number;
  reviewCount: number;
  studentCount: number;
  durationHours: number;
  lessonCount: number;
  level: CourseLevel;
  language: string;
  hasCertificate: boolean;
  isTrending?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  isPublished: boolean;
  publishedAt: string;
  updatedAt: string;
  whatYouWillLearn: string[];
  requirements: string[];
  targetAudience: string[];
  modules: CourseModule[];
  sections?: any[];
  userAccess?: {
    canAccessFull: boolean;
    reason: string;
    canPreviewFree: boolean;
  };
  faqs: { question: string; answer: string }[];
  tags: string[];
  status: CourseStatus;
  settings?: Partial<CourseSettings>;
  seo?: Partial<CourseSeoSettings>;
  analytics?: {
    totalViews?: number;
    completionRate?: number;
    dropoffRate?: number;
    totalWatchTimeHours?: number;
    totalRevenue?: number;
  };
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  nameFa: string;
  description: string;
  iconName?: string;
  icon?: string;
  color?: string;
  image: string;
  courseCount: number;
  subCategories: string[];
}

export interface InstructorProfile {
  id: string;
  name: string;
  nameFa?: string;
  title: string;
  avatar: string;
  coverImage?: string;
  bio: string;
  studentCount: number;
  rating: number;
  reviewCount: number;
  courseCount: number;
  isVerified?: boolean;
  skills?: string[];
  socials?: {
    website?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
  featuredCourseId?: string;
}

export interface LessonNote {
  id: string;
  userId?: string;
  courseId?: string;
  lessonId: string;
  lessonTitle?: string;
  timestampSeconds: number;
  text: string;
  createdAt: string;
}

export type Instructor = InstructorProfile;

export interface Enrollment {
  courseId: string;
  userId: string;
  accessType?: 'FREE' | 'PAID' | 'SUBSCRIPTION' | 'GIFT';
  enrolledAt: string;
  completedLessonIds: string[];
  lastLessonId: string;
  lastPositionSeconds: number;
  progressPercent: number;
  isArchived?: boolean;
  completedAt?: string;
  certificateId?: string;
  notes: {
    id: string;
    lessonId: string;
    lessonTitle: string;
    timestampSeconds: number;
    text: string;
    createdAt: string;
  }[];
}

export interface Certificate {
  id: string;
  certificateNumber?: string;
  courseId: string;
  courseTitle: string;
  instructorName: string;
  studentId?: string;
  studentName: string;
  issueDate: string;
  verificationUrl?: string;
  certificateUrl?: string;
  skills?: string[];
  grade?: string;
  gradeScore?: string;
  verificationCode?: string;
}

export interface CartItem {
  courseId: string;
  course: Course;
  savedForLater?: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'enrollment' | 'lesson' | 'completion' | 'certificate' | 'review' | 'payment' | 'announcement';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface DiscussionMessage {
  id: string;
  courseId: string;
  lessonId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  isInstructor?: boolean;
  text: string;
  createdAt: string;
  upvotes: number;
  userUpvoted?: boolean;
  replies?: DiscussionMessage[];
}

export interface CatalogFilters {
  searchQuery: string;
  categoryId: string;
  subCategory?: string;
  level: string;
  priceType: 'all' | 'free' | 'paid' | 'under50';
  minRating: number;
  duration: 'all' | '0-2' | '3-6' | '7+';
  language: string;
  hasCertificate: boolean;
  sortBy: 'popular' | 'newest' | 'rating' | 'price-asc' | 'price-desc';
  viewMode: 'grid' | 'list';
}

export type AppLanguage = 'en' | 'fa';
export type AppTheme = 'light' | 'dark' | 'system';

export type UserRoleType = 'OWNER' | 'ADMIN' | 'INSTRUCTOR' | 'EDITOR' | 'SUPPORT' | 'STUDENT';

export interface DigitalProduct {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  thumbnail: string;
  fileType: string;
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

export interface HomepageSection {
  id: string;
  sectionType: string;
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
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  buttonStyle?: 'solid' | 'outline' | 'soft' | 'gradient';
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
  isInstructorRegistrationEnabled?: boolean;
  isAlacarteSaleEnabled?: boolean;
  paymentGatewayMode?: 'MOCK_GATEWAY' | 'ZARINPAL';
  zarinpalMerchantId?: string;
  zarinpalSandbox?: boolean;
  updatedAt: string;
}

export interface NavigationItem {
  id: string;
  menuLocation: string;
  label: string;
  labelEn?: string;
  url: string;
  icon?: string;
  parentId?: string | null;
  orderIndex: number;
  isEnabled: boolean;
  targetBlank: boolean;
}

export interface SeoMetadata {
  id: string;
  entityType: string;
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

// Commerce Types
export type OrderStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type PaymentGatewayType = 'MOCK_GATEWAY' | 'ZARINPAL' | 'NEXTPAY' | 'SHAPARAK' | 'STRIPE';

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
  userName?: string;
  userEmail?: string;
  type?: 'SUBSCRIPTION' | 'COURSE';
  subscriptionPlanId?: string;
  durationInMonths?: 1 | 3 | 6 | 9;
  items?: OrderItem[];
  courses?: {
    id: string;
    title: string;
    price: number;
    thumbnail?: string;
  }[];
  subtotal: number;
  discountAmount: number;
  totalAmount?: number;
  total?: number;
  couponCode?: string;
  status: OrderStatus | 'completed' | 'processing' | 'refunded';
  paymentMethod: 'gateway' | 'wallet' | 'card' | 'paypal' | 'applepay';
  paymentGateway?: PaymentGatewayType;
  trackingCode?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt?: string;
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
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id?: string;
  code: string;
  title?: string;
  type?: 'PERCENTAGE' | 'FIXED';
  value?: number;
  discountPercentage?: number;
  minSpend?: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount?: number;
  applicableCourseIds?: string[];
  startDate?: string;
  endDate?: string;
  expiresAt?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  userId: string;
  type: 'PAYMENT' | 'REFUND';
  amount: number;
  currency: string;
  status: 'SUCCESS' | 'FAILED';
  description: string;
  referenceNumber?: string;
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

