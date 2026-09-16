import { Course, CourseStatus, DigitalProduct, Enrollment, User, UserRoleType, LessonNote, CourseProgress, LessonProgress, HomepageSection, SiteSetting, NavigationItem, SeoMetadata, Order, Payment, Coupon, PaymentGatewayType } from '../types/index.js';
import { getStoredAuthToken, setStoredAuthToken, clearStoredAuthToken } from '../utils/auth.js';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = getStoredAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<{ success: boolean; data?: T; message?: string; count?: number }> {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'خطای برقراری ارتباط با سرور.');
    }
    return data;
  } catch (error: any) {
    console.warn(`[API Client Warning: ${endpoint}]:`, error.message);
    throw error;
  }
}

export const api = {
  // Authentication
  auth: {
    async register(payload: { name: string; email: string; phone?: string; password: string; role?: string }) {
      const res = await request<{ user: User; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.data?.token) {
        setStoredAuthToken(res.data.token);
      }
      return res;
    },

    async login(emailOrPhone: string, password: string) {
      const res = await request<{ user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ emailOrPhone, password }),
      });
      if (res.data?.token) {
        setStoredAuthToken(res.data.token);
      }
      return res;
    },

    async getMe() {
      return request<User>('/auth/me');
    },

    async updateProfile(payload: Partial<User>) {
      return request<User>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },

    async changePassword(currentPassword: string, newPassword: string) {
      return request('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    },

    async applyInstructor(data: { expertise: string; experienceYears: string; phone: string; sampleUrl?: string; proposedTopic?: string; bio: string }) {
      return request<{ success: boolean; message: string }>('/auth/apply-instructor', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    logout() {
      clearStoredAuthToken();
    }
  },

  // Courses
  courses: {
    async getAll(params?: { categoryId?: string; search?: string; level?: string; instructorId?: string }) {
      const query = new URLSearchParams();
      if (params?.categoryId && params.categoryId !== 'all') query.append('categoryId', params.categoryId);
      if (params?.search && params.search.trim()) query.append('search', params.search.trim());
      if (params?.level && params.level !== 'all') query.append('level', params.level);
      if (params?.instructorId && params.instructorId !== 'all') query.append('instructorId', params.instructorId);
      const qs = query.toString() ? `?${query.toString()}` : '';
      return request<Course[]>(`/courses${qs}`);
    },

    async getById(idOrSlug: string) {
      return request<Course>(`/courses/${idOrSlug}`);
    },

    async getLesson(courseIdOrSlug: string, lessonId: string) {
      return request<{ courseId: string; courseTitle: string; lesson: any; userAccess: any }>(`/courses/${courseIdOrSlug}/lessons/${lessonId}`);
    },

    async getAdminCourses() {
      return request<Course[]>('/courses/admin/my-courses');
    },

    async create(payload: Partial<Course>) {
      return request<Course>('/courses', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async update(id: string, payload: Partial<Course>) {
      return request<Course>(`/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },

    async setStatus(id: string, status: CourseStatus) {
      return request<Course>(`/courses/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },

    async delete(id: string) {
      return request(`/courses/${id}`, {
        method: 'DELETE',
      });
    }
  },

  // Enrollments
  enrollments: {
    async enroll(courseId: string) {
      return request<{ enrollment: Enrollment; isNew: boolean; courseId?: string }>('/enrollments/enroll', {
        method: 'POST',
        body: JSON.stringify({ courseId }),
      });
    },

    async getMyEnrollments() {
      return request<(Enrollment & { course: Course; progress: CourseProgress })[]>('/enrollments/my-enrollments');
    },

    async check(courseId: string) {
      return request<{ isEnrolled: boolean }>(`/enrollments/check/${courseId}`);
    },

    async archive(courseId: string) {
      return request<{ success: boolean; isArchived: boolean; message: string }>(`/enrollments/archive/${courseId}`, {
        method: 'POST'
      });
    },

    async drop(courseId: string) {
      return request<{ success: boolean; message: string }>(`/enrollments/drop/${courseId}`, {
        method: 'POST'
      });
    }
  },

  // Progress & Notes
  progress: {
    async updateLesson(courseId: string, lessonId: string, isCompleted: boolean, positionSeconds = 0) {
      return request<{ lessonProgress: LessonProgress; courseProgress: CourseProgress }>('/progress/lesson', {
        method: 'POST',
        body: JSON.stringify({ courseId, lessonId, isCompleted, positionSeconds }),
      });
    },

    async getCourseProgress(courseId: string) {
      return request<{ courseProgress: CourseProgress; completedLessonIds: string[] }>(`/progress/course/${courseId}`);
    },

    async saveNote(courseId: string, lessonId: string, text: string, timestampSeconds: number) {
      return request<LessonNote>('/progress/notes', {
        method: 'POST',
        body: JSON.stringify({ courseId, lessonId, text, timestampSeconds }),
      });
    },

    async getNotes(courseId?: string) {
      const qs = courseId ? `?courseId=${courseId}` : '';
      return request<LessonNote[]>(`/progress/notes${qs}`);
    },

    async deleteNote(noteId: string) {
      return request(`/progress/notes/${noteId}`, {
        method: 'DELETE',
      });
    }
  },

  // Digital Products
  products: {
    async getAll() {
      return request<DigitalProduct[]>('/files');
    },

    async getById(id: string) {
      return request<DigitalProduct>(`/files/${id}`);
    },

    async requestDownload(productId: string) {
      return request<{ downloadUrl: string; title: string; fileType: string; fileSize: string }>(`/files/${productId}/request-download`, {
        method: 'POST',
      });
    }
  },

  // CMS & Site Builder
  cms: {
    async getHomepageSections() {
      return request<HomepageSection[]>('/cms/homepage-sections');
    },

    async updateHomepageSection(id: string, payload: Partial<HomepageSection>) {
      return request<HomepageSection>(`/cms/homepage-sections/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },

    async reorderHomepageSections(sectionIds: string[]) {
      return request<HomepageSection[]>('/cms/homepage-sections/reorder', {
        method: 'POST',
        body: JSON.stringify({ sectionIds }),
      });
    },

    async getSettings() {
      return request<SiteSetting>('/cms/settings');
    },

    async updateSettings(payload: Partial<SiteSetting>) {
      return request<SiteSetting>('/cms/settings', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },

    async getNavigation(location?: string) {
      const qs = location ? `?location=${location}` : '';
      return request<NavigationItem[]>(`/cms/navigation${qs}`);
    }
  },

  // Instructor
  instructor: {
    async apply(data: { expertise: string; experienceYears: string; phone: string; sampleUrl?: string; proposedTopic?: string; bio: string }) {
      return request<{ success: boolean; message: string }>('/auth/apply-instructor', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }
  },

  // SEO
  seo: {
    async getEntitySeo(type: string, id: string) {
      return request<SeoMetadata>(`/seo/entity/${type}/${id}`);
    }
  },

  // Admin
  admin: {
    async getStats() {
      return request<{
        totalUsers: number;
        totalCourses: number;
        totalEnrollments: number;
        totalProducts: number;
        totalDownloads: number;
      }>('/admin/stats');
    },

    async getUsers() {
      return request<User[]>('/admin/users');
    },

    async updateUserRoles(userId: string, roles: UserRoleType[]) {
      return request<User>(`/admin/users/${userId}/roles`, {
        method: 'PUT',
        body: JSON.stringify({ roles }),
      });
    },

    async getAuditLogs() {
      return request<any[]>('/admin/audit-logs');
    },

    async wipeTestData(confirmation: string) {
      return request<{
        success: boolean;
        message: string;
        stats: {
          wipedCourses: number;
          wipedEnrollments: number;
          wipedReviews: number;
          wipedOrders: number;
          wipedStudents: number;
          remainingUsers: number;
          retainedAdmin: string;
        };
      }>('/admin/wipe-test-data', {
        method: 'POST',
        body: JSON.stringify({ confirmation }),
      });
    }
  },

  // Commerce & Pricing
  commerce: {
    async validateCoupon(code: string, subtotal: number, courseIds: string[] = []) {
      return request<{
        isValid: boolean;
        message: string;
        discountAmount: number;
        finalTotal: number;
        coupon?: { code: string; title: string; type: string; value: number };
      }>('/commerce/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code, subtotal, courseIds }),
      });
    },

    async checkout(data: {
      courseIds?: string[];
      planId?: string;
      subscriptionPlanId?: string;
      couponCode?: string;
      paymentMethod?: 'gateway' | 'wallet' | 'card';
      paymentGateway?: PaymentGatewayType;
      callbackUrl?: string;
    }) {
      return request<{
        success: boolean;
        order: Order;
        payment?: Payment;
        isFree?: boolean;
        requiresRedirect?: boolean;
        redirectUrl?: string;
        authority?: string;
        trackingCode?: string;
        enrolledCourseIds?: string[];
        subscriptionEndDate?: string;
        message: string;
      }>('/commerce/checkout', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async verifyPayment(data: { orderId: string; authority?: string; status?: string; refId?: string }) {
      return request<{
        success: boolean;
        order: Order;
        payment?: Payment;
        alreadyPaid?: boolean;
        enrolledCourseIds?: string[];
        subscriptionEndDate?: string;
        message: string;
      }>('/commerce/verify-payment', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async getGateways() {
      return request<{ id: PaymentGatewayType; name: string; isReal: boolean }[]>('/commerce/gateways');
    },

    async getMyOrders(page = 1, limit = 20) {
      return request<{
        orders: Order[];
        totalCount: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(`/commerce/orders/my?page=${page}&limit=${limit}`);
    },

    async getAllOrders(params: { status?: string; search?: string; page?: number; limit?: number } = {}) {
      const query = new URLSearchParams();
      if (params.status) query.set('status', params.status);
      if (params.search) query.set('search', params.search);
      if (params.page) query.set('page', params.page.toString());
      if (params.limit) query.set('limit', params.limit.toString());
      return request<{
        orders: Order[];
        totalCount: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(`/commerce/orders?${query.toString()}`);
    },

    async getOrderById(orderId: string) {
      return request<{ order: Order; payments: Payment[] }>(`/commerce/orders/${orderId}`);
    },

    async updateOrderStatus(orderId: string, status: string) {
      return request<Order>(`/commerce/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },

    async getCoupons() {
      return request<Coupon[]>('/commerce/coupons');
    },

    async createCoupon(data: Partial<Coupon>) {
      return request<Coupon>('/commerce/coupons', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async updateCoupon(id: string, data: Partial<Coupon>) {
      return request<Coupon>(`/commerce/coupons/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    async deleteCoupon(id: string) {
      return request<{ success: boolean; message: string }>(`/commerce/coupons/${id}`, {
        method: 'DELETE',
      });
    },

    async updateCoursePricing(courseId: string, pricing: {
      isFree: boolean;
      price: number;
      originalPrice?: number;
      salePrice?: number;
      discountPercentage?: number;
      currency?: string;
      saleStart?: string;
      saleEnd?: string;
      isSaleEnabled?: boolean;
    }) {
      return request<any>(`/commerce/courses/${courseId}/pricing`, {
        method: 'PUT',
        body: JSON.stringify(pricing),
      });
    },

    // Subscription Plans Management
    async getSubscriptionPlans(all: boolean = true) {
      return request<{ success: boolean; data: any[] }>(`/commerce/subscription-plans?all=${all}`);
    },

    async updateSubscriptionPlan(id: string, data: any) {
      return request<{ success: boolean; data: any }>(`/commerce/subscription-plans/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    async createSubscriptionPlan(data: any) {
      return request<{ success: boolean; data: any }>('/commerce/subscription-plans', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async deleteSubscriptionPlan(id: string) {
      return request<{ success: boolean; data: any }>(`/commerce/subscription-plans/${id}`, {
        method: 'DELETE',
      });
    },

    async grantUserSubscription(userId: string, durationInMonths: 1 | 3 | 6 | 9) {
      return request<{ success: boolean; data: any }>(`/commerce/users/${userId}/grant-subscription`, {
        method: 'POST',
        body: JSON.stringify({ durationInMonths }),
      });
    },

    async revokeUserSubscription(userId: string) {
      return request<{ success: boolean; data: any }>(`/commerce/users/${userId}/revoke-subscription`, {
        method: 'POST',
      });
    }
  }
};
