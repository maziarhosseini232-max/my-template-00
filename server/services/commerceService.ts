import { db } from '../db/index.js';
import { 
  Order, OrderItem, Payment, Coupon, PaymentTransaction, 
  OrderStatus, PaymentGatewayType, SubscriptionPlan 
} from '../db/schema.js';
import { paymentGatewayRegistry } from './paymentProvider.js';
import { enrollmentService } from './enrollmentService.js';

export class CommerceService {

  /**
   * Validate Coupon code against cart items
   */
  async validateCoupon(code: string, subtotal: number, courseIds: string[] = []) {
    if (!code) {
      throw new Error('کد تخفیف ارسال نشده است.');
    }

    const normalizedCode = code.trim().toUpperCase();
    const coupon = db.coupons.find(c => c.code.toUpperCase() === normalizedCode && c.isActive);

    if (!coupon) {
      return {
        isValid: false,
        message: 'کد تخفیف وارد شده نامعتبر یا منقضی شده است.',
        discountAmount: 0,
        finalTotal: subtotal
      };
    }

    const now = new Date();
    if (coupon.startDate && new Date(coupon.startDate) > now) {
      return {
        isValid: false,
        message: 'مهلت استفاده از این کد تخفیف هنوز آغاز نشده است.',
        discountAmount: 0,
        finalTotal: subtotal
      };
    }

    if (coupon.endDate && new Date(coupon.endDate) < now) {
      return {
        isValid: false,
        message: 'مهلت استفاده از این کد تخفیف به پایان رسیده است.',
        discountAmount: 0,
        finalTotal: subtotal
      };
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return {
        isValid: false,
        message: 'ظرفیت استفاده از این کد تخفیف تکمیل شده است.',
        discountAmount: 0,
        finalTotal: subtotal
      };
    }

    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return {
        isValid: false,
        message: `حداقل مبلغ سفارش برای استفاده از این کد ${coupon.minOrderAmount.toLocaleString('fa-IR')} تومان است.`,
        discountAmount: 0,
        finalTotal: subtotal
      };
    }

    // Check course applicability
    if (coupon.applicableCourseIds && coupon.applicableCourseIds.length > 0) {
      const isApplicable = courseIds.some(id => coupon.applicableCourseIds!.includes(id));
      if (!isApplicable) {
        return {
          isValid: false,
          message: 'این کد تخفیف برای دوره‌های انتخابی شما در سبد خرید معتبر نیست.',
          discountAmount: 0,
          finalTotal: subtotal
        };
      }
    }

    let discountAmount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discountAmount = Math.round((subtotal * coupon.value) / 100);
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = Math.min(coupon.value, subtotal);
    }

    const finalTotal = Math.max(0, subtotal - discountAmount);

    return {
      isValid: true,
      message: `کد تخفیف با موفقیت اعمال گردید (${coupon.title}).`,
      coupon: {
        code: coupon.code,
        title: coupon.title,
        type: coupon.type,
        value: coupon.value
      },
      discountAmount,
      finalTotal
    };
  }

  /**
   * Process Checkout: Order creation, Payment handling, and Instant Enrollment
   */
  async checkout(userId: string, data: {
    courseIds?: string[];
    planId?: string;
    subscriptionPlanId?: string;
    couponCode?: string;
    paymentMethod?: 'gateway' | 'wallet' | 'card';
    paymentGateway?: PaymentGatewayType;
    callbackUrl?: string;
  }) {
    // 1. Verify User
    const user = db.users.find(u => u.id === userId && !u.deletedAt && u.isActive);
    if (!user) {
      throw new Error('کاربر نامعتبر یا غیرفعال است.');
    }

    const orderItems: OrderItem[] = [];
    let subtotal = 0;
    let orderType: 'SUBSCRIPTION' | 'COURSE' = 'COURSE';
    let targetPlan: SubscriptionPlan | undefined = undefined;

    const subPlanId = data.planId || data.subscriptionPlanId;

    // 2. Determine Order Type: VIP Subscription vs Courses
    if (subPlanId) {
      orderType = 'SUBSCRIPTION';
      targetPlan = db.subscriptionPlans.find(p => p.id === subPlanId);
      if (!targetPlan) {
        throw new Error('پلن اشتراک انتخابی معتبر نمی‌باشد.');
      }

      const effectivePrice = (targetPlan.discountedPrice !== undefined && targetPlan.discountedPrice > 0 && targetPlan.discountedPrice < targetPlan.price)
        ? targetPlan.discountedPrice
        : targetPlan.price;
      subtotal = effectivePrice;

      orderItems.push({
        subscriptionPlanId: targetPlan.id,
        durationInMonths: targetPlan.durationInMonths,
        title: `اشتراک ویژه VIP (${targetPlan.title})`,
        price: effectivePrice,
        originalPrice: targetPlan.price
      });
    } else if (data.courseIds && data.courseIds.length > 0) {
      orderType = 'COURSE';
      for (const cId of data.courseIds) {
        const course = db.courses.find(c => (c.id === cId || c.slug === cId) && !c.deletedAt);
        if (!course) {
          throw new Error(`دوره با شناسه ${cId} یافت نشد.`);
        }

        const instructor = db.users.find(u => u.id === course.instructorId);
        const effectivePrice = course.isFree ? 0 : (course.price || 0);
        const effectiveOriginalPrice = course.originalPrice || effectivePrice;

        orderItems.push({
          courseId: course.id,
          title: course.title,
          price: effectivePrice,
          originalPrice: effectiveOriginalPrice,
          instructorId: course.instructorId,
          instructorName: instructor?.name || 'مدرس آکادمی'
        });

        subtotal += effectivePrice;
      }
    } else {
      throw new Error('سبد خرید شما خالی است یا پلن اشتراکی انتخاب نشده است.');
    }

    // 3. Apply Coupon if provided
    let discountAmount = 0;
    let validCouponCode: string | undefined = undefined;

    if (data.couponCode && subtotal > 0) {
      const couponCheck = await this.validateCoupon(
        data.couponCode, 
        subtotal, 
        orderItems.filter(i => i.courseId).map(i => i.courseId!)
      );
      if (couponCheck.isValid) {
        discountAmount = couponCheck.discountAmount;
        validCouponCode = couponCheck.coupon?.code;
      }
    }

    const totalAmount = Math.max(0, subtotal - discountAmount);
    const now = new Date().toISOString();
    const orderNumber = 'LUM-' + (10400 + db.orders.length + 1);

    // 4. Build Order Record
    const order: Order = {
      id: 'ord_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      orderNumber,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      type: orderType,
      subscriptionPlanId: targetPlan?.id,
      durationInMonths: targetPlan?.durationInMonths,
      items: orderItems,
      subtotal,
      discountAmount,
      totalAmount,
      couponCode: validCouponCode,
      status: totalAmount === 0 ? 'PAID' : 'PENDING',
      paymentMethod: data.paymentMethod || 'gateway',
      paymentGateway: data.paymentGateway || 'MOCK_GATEWAY',
      createdAt: now,
      updatedAt: now
    };

    db.orders.push(order);

    // 5. If Order is completely Free (0 Toman)
    if (totalAmount === 0) {
      order.status = 'PAID';
      order.paidAt = now;
      order.trackingCode = 'FREE-' + Math.floor(100000 + Math.random() * 900000);

      const fakePayment: Payment = {
        id: 'pay_free_' + Date.now(),
        orderId: order.id,
        userId: user.id,
        amount: 0,
        currency: 'IRT',
        gateway: 'MOCK_GATEWAY',
        transactionId: order.trackingCode,
        trackingCode: order.trackingCode,
        status: 'PAID',
        paidAt: now,
        createdAt: now,
        updatedAt: now
      };
      db.payments.push(fakePayment);

      const fulfillment = await this.fulfillOrder(order, fakePayment);

      return {
        success: true,
        order,
        isFree: true,
        ...fulfillment
      };
    }

    // 6. Paid Flow via Active Gateway Provider
    const activeGatewayType = data.paymentGateway || (db.siteSetting.paymentGatewayMode === 'ZARINPAL' ? 'ZARINPAL' : 'MOCK_GATEWAY');
    order.paymentGateway = activeGatewayType;
    const gateway = paymentGatewayRegistry.getProvider(activeGatewayType);
    
    // Initiate payment
    const paymentDesc = order.type === 'SUBSCRIPTION'
      ? `خرید اشتراک ویژه ${order.durationInMonths} ماهه لومینا لرن`
      : `خرید دوره‌های آموزشی لومینا لرن (${order.items.map(i => i.title).join('، ')})`;

    const initRes = await gateway.initiatePayment({
      orderId: order.id,
      orderNumber: order.orderNumber,
      userId: user.id,
      userEmail: user.email,
      amount: totalAmount,
      currency: 'IRT',
      description: paymentDesc,
      callbackUrl: data.callbackUrl
    });

    if (!initRes.success) {
      order.status = 'FAILED';
      throw new Error(initRes.message || 'خطا در برقراری ارتباط با درگاه پرداخت');
    }

    order.trackingCode = initRes.trackingCode;

    // If active gateway is ZarinPal or provides a sandbox redirect URL (TASK 1: MockGateway)
    if (gateway.gatewayName === 'ZARINPAL' || Boolean(initRes.redirectUrl)) {
      order.status = 'PENDING';
      return {
        success: true,
        order,
        gateway: gateway.gatewayName,
        requiresRedirect: true,
        redirectUrl: initRes.redirectUrl || `/mock-gateway?authority=${initRes.transactionId}&order=${order.id}&amount=${totalAmount}&trackingCode=${initRes.trackingCode}`,
        authority: initRes.transactionId,
        trackingCode: initRes.trackingCode,
        message: 'در حال هدایت به درگاه پرداخت شاپرک / زرین‌پال...'
      };
    }

    // Otherwise Mock Gateway immediate verification flow
    const verifyRes = await gateway.verifyPayment({
      transactionId: initRes.transactionId,
      trackingCode: initRes.trackingCode,
      amount: totalAmount
    });

    if (verifyRes.success && verifyRes.status === 'PAID') {
      order.status = 'PAID';
      order.paidAt = verifyRes.paidAt || now;
      order.trackingCode = verifyRes.trackingCode;

      // Create Payment Record
      const payment: Payment = {
        id: 'pay_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        orderId: order.id,
        userId: user.id,
        amount: totalAmount,
        currency: 'IRT',
        gateway: gateway.gatewayName,
        transactionId: verifyRes.transactionId,
        trackingCode: verifyRes.trackingCode,
        status: 'PAID',
        cardPanMasked: verifyRes.cardPanMasked || '۶۰۳۷-۹۹**-****-۲۸۹۴',
        paidAt: order.paidAt,
        createdAt: now,
        updatedAt: now
      };
      db.payments.push(payment);

      // Create Payment Transaction Log
      const transaction: PaymentTransaction = {
        id: 'txn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        orderId: order.id,
        userId: user.id,
        type: 'PAYMENT',
        amount: totalAmount,
        currency: 'IRT',
        status: 'SUCCESS',
        description: `پرداخت موفق سفارش ${order.orderNumber} به مبلغ ${totalAmount.toLocaleString('fa-IR')} تومان`,
        referenceNumber: verifyRes.transactionId,
        createdAt: now
      };
      db.paymentTransactions.push(transaction);

      // Update coupon usage count
      if (validCouponCode) {
        const coupon = db.coupons.find(c => c.code.toUpperCase() === validCouponCode!.toUpperCase());
        if (coupon) {
          coupon.usedCount += 1;
        }
      }

      // Fulfill order benefits (Subscription or Course Enrollments)
      const fulfillment = await this.fulfillOrder(order, payment);

      return {
        success: true,
        order,
        payment,
        ...fulfillment
      };
    } else {
      order.status = 'FAILED';
      throw new Error(verifyRes.errorMessage || 'پرداخت از سوی بانک تایید نشد.');
    }
  }

  /**
   * Verify Payment callback (ZarinPal or external gateway return)
   */
  async verifyPayment(userId: string, data: { orderId: string; authority?: string; status?: string; refId?: string }) {
    const order = db.orders.find(o => o.id === data.orderId && o.userId === userId);
    if (!order) {
      throw new Error('سفارش مورد نظر یافت نشد.');
    }

    if (order.status === 'PAID') {
      const existingPayment = db.payments.find(p => p.orderId === order.id);
      const user = db.users.find(u => u.id === order.userId);
      return {
        success: true,
        order,
        payment: existingPayment,
        alreadyPaid: true,
        subscriptionEndDate: user?.subscriptionEndDate,
        enrolledCourseIds: order.items.map(i => i.courseId),
        message: 'این سفارش قبلاً پرداخت و تایید شده است.'
      };
    }

    if (data.status === 'NOK' || data.status === 'FAILED' || data.status === 'CANCELLED') {
      order.status = 'FAILED';
      order.updatedAt = new Date().toISOString();
      throw new Error('پرداخت توسط کاربر لغو شد یا ناموفق بود.');
    }

    const gateway = paymentGatewayRegistry.getProvider(order.paymentGateway || 'ZARINPAL');
    const verifyRes = await gateway.verifyPayment({
      transactionId: data.authority || order.trackingCode || '',
      trackingCode: data.refId || order.trackingCode,
      amount: order.totalAmount
    });

    if (verifyRes.success && verifyRes.status === 'PAID') {
      const now = new Date().toISOString();
      order.status = 'PAID';
      order.paidAt = verifyRes.paidAt || now;
      order.trackingCode = verifyRes.trackingCode;
      order.updatedAt = now;

      // Create Payment Record
      const payment: Payment = {
        id: 'pay_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        orderId: order.id,
        userId: order.userId,
        amount: order.totalAmount,
        currency: 'IRT',
        gateway: gateway.gatewayName,
        transactionId: verifyRes.transactionId,
        trackingCode: verifyRes.trackingCode,
        status: 'PAID',
        cardPanMasked: verifyRes.cardPanMasked || '۵۰۲۲-۲۹**-****-۸۸۳۱',
        paidAt: order.paidAt,
        createdAt: now,
        updatedAt: now
      };
      db.payments.push(payment);

      // Create Payment Transaction Log
      const transaction: PaymentTransaction = {
        id: 'txn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        orderId: order.id,
        userId: order.userId,
        type: 'PAYMENT',
        amount: order.totalAmount,
        currency: 'IRT',
        status: 'SUCCESS',
        description: `تایید پرداخت زرین‌پال شاپرک سفارش ${order.orderNumber} به مبلغ ${order.totalAmount.toLocaleString('fa-IR')} تومان`,
        referenceNumber: verifyRes.transactionId,
        createdAt: now
      };
      db.paymentTransactions.push(transaction);

      // Update coupon usage count if used
      if (order.couponCode) {
        const coupon = db.coupons.find(c => c.code.toUpperCase() === order.couponCode!.toUpperCase());
        if (coupon) {
          coupon.usedCount += 1;
        }
      }

      // Fulfill order benefits (Subscription or Course Enrollments)
      const fulfillment = await this.fulfillOrder(order, payment);

      return {
        success: true,
        order,
        payment,
        ...fulfillment
      };
    } else {
      order.status = 'FAILED';
      order.updatedAt = new Date().toISOString();
      throw new Error(verifyRes.errorMessage || 'پرداخت از سوی درگاه بانکی تایید نگردید.');
    }
  }

  /**
   * Get Orders with search and pagination
   */
  async getOrders(query: {
    userId?: string;
    status?: OrderStatus;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    let orders = [...db.orders];

    if (query.userId) {
      orders = orders.filter(o => o.userId === query.userId);
    }

    if (query.status) {
      orders = orders.filter(o => o.status === query.status);
    }

    if (query.search) {
      const q = query.search.toLowerCase().trim();
      orders = orders.filter(o => 
        o.orderNumber.toLowerCase().includes(q) ||
        o.userName.toLowerCase().includes(q) ||
        o.userEmail.toLowerCase().includes(q) ||
        (o.trackingCode && o.trackingCode.toLowerCase().includes(q)) ||
        o.items.some(i => i.title.toLowerCase().includes(q))
      );
    }

    // Sort descending by creation date
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const startIndex = (page - 1) * limit;
    const paginatedOrders = orders.slice(startIndex, startIndex + limit);

    return {
      orders: paginatedOrders,
      totalCount: orders.length,
      page,
      limit,
      totalPages: Math.ceil(orders.length / limit)
    };
  }

  /**
   * Get Order by ID
   */
  async getOrderById(orderId: string, requestingUser?: { userId: string; roles: string[] }) {
    const order = db.orders.find(o => o.id === orderId);
    if (!order) {
      throw new Error('سفارش مورد نظر یافت نشد.');
    }

    // Security check: only order owner or admin/owner can view
    if (requestingUser) {
      const isAdmin = requestingUser.roles.includes('ADMIN') || requestingUser.roles.includes('OWNER');
      if (!isAdmin && order.userId !== requestingUser.userId) {
        throw new Error('شما مجاز به مشاهده این سفارش نیستید.');
      }
    }

    const payments = db.payments.filter(p => p.orderId === order.id);
    return { order, payments };
  }

  /**
   * Update Order Status (Admin)
   */
  async updateOrderStatus(orderId: string, status: OrderStatus, adminUserId: string) {
    const order = db.orders.find(o => o.id === orderId);
    if (!order) {
      throw new Error('سفارش مورد نظر یافت نشد.');
    }

    order.status = status;
    order.updatedAt = new Date().toISOString();

    // If order was refunded or cancelled, deactivate enrollments
    if (status === 'REFUNDED' || status === 'CANCELLED') {
      for (const item of order.items) {
        const enr = db.enrollments.find(e => e.userId === order.userId && e.courseId === item.courseId);
        if (enr) {
          enr.isActive = false;
        }
      }
    }

    return order;
  }

  /**
   * Get all Coupons
   */
  async getCoupons() {
    return [...db.coupons].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Create Coupon
   */
  async createCoupon(data: {
    code: string;
    title: string;
    type: 'PERCENTAGE' | 'FIXED';
    value: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    usageLimit?: number;
    applicableCourseIds?: string[];
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
  }) {
    if (!data.code || !data.code.trim()) {
      const err: any = new Error('کد تخفیف الزامی است.');
      err.status = 400;
      throw err;
    }
    if (!data.title || !data.title.trim()) {
      const err: any = new Error('عنوان کد تخفیف الزامی است.');
      err.status = 400;
      throw err;
    }
    const val = Number(data.value);
    if (isNaN(val) || val < 0) {
      const err: any = new Error('مقدار تخفیف باید عددی نامنفی باشد.');
      err.status = 400;
      throw err;
    }
    if (data.type === 'PERCENTAGE' && val > 100) {
      const err: any = new Error('درصد تخفیف نمی‌تواند بیشتر از ۱۰۰ باشد.');
      err.status = 400;
      throw err;
    }

    const normalizedCode = data.code.trim().toUpperCase();
    const existing = db.coupons.find(c => c.code.toUpperCase() === normalizedCode);
    if (existing) {
      const err: any = new Error('کد تخفیف با این عنوان قبلاً تعریف شده است.');
      err.status = 400;
      throw err;
    }

    const now = new Date().toISOString();
    const newCoupon: Coupon = {
      id: 'cpn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      code: normalizedCode,
      title: data.title.trim(),
      type: data.type,
      value: val,
      minOrderAmount: data.minOrderAmount ? Math.max(0, Number(data.minOrderAmount)) : undefined,
      maxDiscountAmount: data.maxDiscountAmount ? Math.max(0, Number(data.maxDiscountAmount)) : undefined,
      usageLimit: data.usageLimit ? Math.max(0, Number(data.usageLimit)) : undefined,
      usedCount: 0,
      applicableCourseIds: data.applicableCourseIds || [],
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: now,
      updatedAt: now
    };

    db.coupons.push(newCoupon);
    return newCoupon;
  }

  /**
   * Update Coupon
   */
  async updateCoupon(id: string, data: Partial<Coupon>) {
    const coupon = db.coupons.find(c => c.id === id);
    if (!coupon) {
      const err: any = new Error('کد تخفیف یافت نشد.');
      err.status = 404;
      throw err;
    }

    if (data.code !== undefined) {
      if (!data.code.trim()) {
        const err: any = new Error('کد تخفیف نمی‌تواند خالی باشد.');
        err.status = 400;
        throw err;
      }
      coupon.code = data.code.trim().toUpperCase();
    }
    if (data.title !== undefined) {
      if (!data.title.trim()) {
        const err: any = new Error('عنوان تخفیف نمی‌تواند خالی باشد.');
        err.status = 400;
        throw err;
      }
      coupon.title = data.title.trim();
    }
    if (data.type) coupon.type = data.type;
    if (data.value !== undefined) {
      const val = Number(data.value);
      if (isNaN(val) || val < 0) {
        const err: any = new Error('مقدار تخفیف باید عددی نامنفی باشد.');
        err.status = 400;
        throw err;
      }
      if (coupon.type === 'PERCENTAGE' && val > 100) {
        const err: any = new Error('درصد تخفیف نمی‌تواند بیشتر از ۱۰۰ باشد.');
        err.status = 400;
        throw err;
      }
      coupon.value = val;
    }
    if (data.minOrderAmount !== undefined) coupon.minOrderAmount = Math.max(0, Number(data.minOrderAmount));
    if (data.maxDiscountAmount !== undefined) coupon.maxDiscountAmount = Math.max(0, Number(data.maxDiscountAmount));
    if (data.usageLimit !== undefined) coupon.usageLimit = Math.max(0, Number(data.usageLimit));
    if (data.applicableCourseIds !== undefined) coupon.applicableCourseIds = data.applicableCourseIds;
    if (data.startDate !== undefined) coupon.startDate = data.startDate;
    if (data.endDate !== undefined) coupon.endDate = data.endDate;
    if (data.isActive !== undefined) coupon.isActive = data.isActive;

    coupon.updatedAt = new Date().toISOString();
    return coupon;
  }

  /**
   * Delete Coupon
   */
  async deleteCoupon(id: string) {
    const idx = db.coupons.findIndex(c => c.id === id);
    if (idx === -1) {
      const err: any = new Error('کد تخفیف یافت نشد.');
      err.status = 404;
      throw err;
    }
    db.coupons.splice(idx, 1);
    return { success: true, message: 'کد تخفیف حذف گردید.' };
  }

  /**
   * Dynamic Course Pricing Management (No-code Admin Update)
   */
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
    const course = db.courses.find(c => c.id === courseId && !c.deletedAt);
    if (!course) {
      const err: any = new Error('دوره مورد نظر یافت نشد.');
      err.status = 404;
      throw err;
    }

    const price = pricing.isFree ? 0 : Number(pricing.price);
    if (isNaN(price) || price < 0) {
      const err: any = new Error('قیمت دوره باید عددی نامنفی باشد.');
      err.status = 400;
      throw err;
    }

    const originalPrice = pricing.isFree ? 0 : (pricing.originalPrice !== undefined ? Number(pricing.originalPrice) : price);
    if (isNaN(originalPrice) || originalPrice < 0) {
      const err: any = new Error('قیمت اصلی باید عددی نامنفی باشد.');
      err.status = 400;
      throw err;
    }

    const discountPercentage = pricing.isFree ? 0 : (pricing.discountPercentage !== undefined ? Number(pricing.discountPercentage) : 0);
    if (isNaN(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) {
      const err: any = new Error('درصد تخفیف باید بین ۰ تا ۱۰۰ باشد.');
      err.status = 400;
      throw err;
    }

    course.isFree = Boolean(pricing.isFree);
    course.accessType = course.isFree ? 'FREE' : 'PAID';
    course.price = price;
    course.originalPrice = originalPrice;
    course.salePrice = price;
    course.discountPrice = price;
    course.discountPercentage = discountPercentage;
    course.currency = pricing.currency || 'IRT';
    course.saleStart = pricing.saleStart;
    course.saleEnd = pricing.saleEnd;
    course.isSaleEnabled = pricing.isSaleEnabled !== undefined ? pricing.isSaleEnabled : false;
    course.updatedAt = new Date().toISOString();

    return {
      courseId: course.id,
      title: course.title,
      isFree: course.isFree,
      accessType: course.accessType,
      price: course.price,
      originalPrice: course.originalPrice,
      discountPercentage: course.discountPercentage,
      currency: course.currency,
      isSaleEnabled: course.isSaleEnabled,
      updatedAt: course.updatedAt
    };
  }
  /**
   * Helper: Fulfill order benefits upon confirmed payment
   * Handles both VIP Subscription purchases and individual course enrollments
   */
  async fulfillOrder(order: Order, payment: Payment) {
    const user = db.users.find(u => u.id === order.userId);
    let newSubscriptionEndDate: string | undefined = undefined;
    let wasStacked = false;
    let planMonths = 1;

    // 1. VIP Subscription purchase fulfillment
    if (order.type === 'SUBSCRIPTION' || order.subscriptionPlanId || (order.durationInMonths && order.durationInMonths > 0)) {
      let months = order.durationInMonths;
      if (!months && order.subscriptionPlanId) {
        const foundPlan = db.subscriptionPlans.find(p => p.id === order.subscriptionPlanId);
        months = foundPlan?.durationInMonths;
      }
      if (!months || months <= 0) {
        months = 1;
      }
      planMonths = months;

      const currentExpiry = (user && user.subscriptionEndDate) ? new Date(user.subscriptionEndDate).getTime() : 0;
      const isCurrentlyActive = currentExpiry > Date.now();
      wasStacked = isCurrentlyActive;

      // Stacking logic: if active, add to current expiry date; otherwise start from Date.now()
      const baseTime = isCurrentlyActive ? currentExpiry : Date.now();
      
      const baseDate = new Date(baseTime);
      const targetMonth = baseDate.getMonth() + months;
      const newExpiryDate = new Date(baseDate);
      newExpiryDate.setMonth(targetMonth);
      // Handle potential day-overflow (e.g. Jan 31 -> Feb 28/29)
      if (newExpiryDate.getMonth() !== (targetMonth % 12)) {
        newExpiryDate.setDate(0);
      }
      newSubscriptionEndDate = newExpiryDate.toISOString();

      if (user) {
        user.subscriptionEndDate = newSubscriptionEndDate;
        user.updatedAt = new Date().toISOString();
      }
    }

    // 2. Individual courses enrollment if any course items present
    const enrolledCourseIds: string[] = [];
    for (const item of order.items) {
      if (item.courseId) {
        await enrollmentService.enroll(order.userId, item.courseId, 'PAID');
        enrolledCourseIds.push(item.courseId);
      }
    }

    return {
      success: true,
      order,
      payment,
      wasStacked,
      subscriptionEndDate: newSubscriptionEndDate || user?.subscriptionEndDate,
      enrolledCourseIds,
      message: order.type === 'SUBSCRIPTION'
        ? (wasStacked 
            ? `پرداخت تایید شد و مدت ${planMonths} ماه به انتهای اشتراک فعلی شما افزوده شد (انباشت هوشمند).`
            : `پرداخت با موفقیت انجام شد و اشتراک ویژه (VIP) به مدت ${planMonths} ماه فعال گردید.`)
        : 'پرداخت با موفقیت انجام شد و دسترسی به دوره‌ها فعال گردید.'
    };
  }

  /**
   * Subscription Plans CRUD operations
   */
  async getSubscriptionPlans(onlyActive = true) {
    let plans = db.subscriptionPlans;
    if (onlyActive) {
      plans = plans.filter(p => p.isActive);
    }
    return plans.sort((a, b) => a.durationInMonths - b.durationInMonths);
  }

  async getSubscriptionPlanById(planId: string) {
    const plan = db.subscriptionPlans.find(p => p.id === planId);
    if (!plan) {
      const err: any = new Error('پلن اشتراک مورد نظر یافت نشد.');
      err.status = 404;
      throw err;
    }
    return plan;
  }

  async createSubscriptionPlan(data: {
    title: string;
    durationInMonths: 1 | 3 | 6 | 9;
    price: number;
    discountedPrice?: number;
    features?: string[];
    isPopular?: boolean;
    isActive?: boolean;
  }) {
    if (!data.title || !data.title.trim()) {
      const err: any = new Error('عنوان پلن اشتراک الزامی است.');
      err.status = 400;
      throw err;
    }

    if (![1, 3, 6, 9].includes(data.durationInMonths)) {
      const err: any = new Error('مدت زمان اشتراک باید ۱، ۳، ۶ یا ۹ ماه باشد.');
      err.status = 400;
      throw err;
    }

    const price = Number(data.price);
    if (data.price === undefined || isNaN(price) || price < 0) {
      const err: any = new Error('قیمت پلن باید مشخص و عددی نامنفی باشد.');
      err.status = 400;
      throw err;
    }

    let discPrice: number | undefined = undefined;
    if (data.discountedPrice !== undefined) {
      discPrice = Number(data.discountedPrice);
      if (isNaN(discPrice) || discPrice < 0) {
        const err: any = new Error('قیمت با تخفیف پلن باید عددی نامنفی باشد.');
        err.status = 400;
        throw err;
      }
    }

    const now = new Date().toISOString();
    const newPlan: SubscriptionPlan = {
      id: `plan_sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: data.title.trim(),
      durationInMonths: data.durationInMonths,
      price: price,
      discountedPrice: discPrice,
      features: data.features || [],
      isPopular: !!data.isPopular,
      isActive: data.isActive !== undefined ? !!data.isActive : true,
      createdAt: now,
      updatedAt: now
    };

    db.subscriptionPlans.push(newPlan);
    db.saveSnapshotSync();
    return newPlan;
  }

  async updateSubscriptionPlan(planId: string, updates: Partial<SubscriptionPlan>) {
    const plan = db.subscriptionPlans.find(p => p.id === planId);
    if (!plan) {
      const err: any = new Error('پلن اشتراک یافت نشد.');
      err.status = 404;
      throw err;
    }

    if (updates.durationInMonths !== undefined) {
      if (![1, 3, 6, 9].includes(updates.durationInMonths)) {
        const err: any = new Error('مدت زمان اشتراک باید ۱، ۳، ۶ یا ۹ ماه باشد.');
        err.status = 400;
        throw err;
      }
      plan.durationInMonths = updates.durationInMonths;
    }

    if (updates.title !== undefined) {
      if (!updates.title.trim()) {
        const err: any = new Error('عنوان پلن اشتراک نمی‌تواند خالی باشد.');
        err.status = 400;
        throw err;
      }
      plan.title = updates.title.trim();
    }
    if (updates.price !== undefined) {
      const p = Number(updates.price);
      if (isNaN(p) || p < 0) {
        const err: any = new Error('قیمت پلن باید عددی نامنفی باشد.');
        err.status = 400;
        throw err;
      }
      plan.price = p;
    }
    if (updates.discountedPrice !== undefined) {
      const dp = (updates.discountedPrice === null || Number(updates.discountedPrice) <= 0)
        ? undefined
        : Number(updates.discountedPrice);
      if (dp !== undefined && (isNaN(dp) || dp < 0)) {
        const err: any = new Error('قیمت تخفیف‌خورده باید عددی نامنفی باشد.');
        err.status = 400;
        throw err;
      }
      plan.discountedPrice = dp;
    }
    if (updates.features !== undefined) plan.features = updates.features;
    if (updates.isPopular !== undefined) plan.isPopular = !!updates.isPopular;
    if (updates.isActive !== undefined) plan.isActive = !!updates.isActive;

    plan.updatedAt = new Date().toISOString();
    db.saveSnapshotSync();
    return plan;
  }

  async deleteSubscriptionPlan(planId: string) {
    const index = db.subscriptionPlans.findIndex(p => p.id === planId);
    if (index === -1) {
      const err: any = new Error('پلن اشتراک یافت نشد.');
      err.status = 404;
      throw err;
    }

    db.subscriptionPlans.splice(index, 1);
    db.saveSnapshotSync();
    return { success: true, message: 'پلن اشتراک با موفقیت حذف گردید.' };
  }

  /**
   * Admin: Grant/Extend manual subscription for any user
   */
  async grantUserSubscription(userId: string, durationInMonths: 1 | 3 | 6 | 9) {
    const user = db.users.find(u => u.id === userId && !u.deletedAt);
    if (!user) {
      const err: any = new Error('کاربر یافت نشد.');
      err.status = 404;
      throw err;
    }

    const currentExpiry = user.subscriptionEndDate ? new Date(user.subscriptionEndDate).getTime() : 0;
    const baseTime = currentExpiry > Date.now() ? currentExpiry : Date.now();
    const newExpiry = new Date(baseTime);
    newExpiry.setMonth(newExpiry.getMonth() + durationInMonths);

    user.subscriptionEndDate = newExpiry.toISOString();
    user.updatedAt = new Date().toISOString();

    return {
      success: true,
      userId: user.id,
      userName: user.name,
      subscriptionEndDate: user.subscriptionEndDate,
      message: `اشتراک ویژه ${durationInMonths} ماهه با موفقیت برای کاربر فعال گردید.`
    };
  }

  /**
   * Admin: Revoke user subscription
   */
  async revokeUserSubscription(userId: string) {
    const user = db.users.find(u => u.id === userId && !u.deletedAt);
    if (!user) {
      const err: any = new Error('کاربر یافت نشد.');
      err.status = 404;
      throw err;
    }

    user.subscriptionEndDate = null;
    user.updatedAt = new Date().toISOString();

    return {
      success: true,
      userId: user.id,
      message: 'اشتراک کاربر با موفقیت لغو شد.'
    };
  }
}

export const commerceService = new CommerceService();
