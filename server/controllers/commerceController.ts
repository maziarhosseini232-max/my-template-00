import { Response, NextFunction } from 'express';
import { commerceService } from '../services/commerceService.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class CommerceController {
  /**
   * Validate Coupon
   * POST /api/commerce/coupons/validate
   */
  async validateCoupon(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { code, subtotal, courseIds } = req.body;
      const result = await commerceService.validateCoupon(code, Number(subtotal) || 0, courseIds || []);
      res.json({ success: true, data: result });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Checkout (Cart -> Order -> Gateway -> Enrollment)
   * POST /api/commerce/checkout
   */
  async checkout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'لطفاً ابتدا وارد حساب کاربری خود شوید.' });
      }

      const { courseIds, planId, subscriptionPlanId, couponCode, paymentMethod, paymentGateway, callbackUrl } = req.body;
      const result = await commerceService.checkout(req.user.userId, {
        courseIds,
        planId,
        subscriptionPlanId,
        couponCode,
        paymentMethod,
        paymentGateway,
        callbackUrl
      });

      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Verify Payment callback
   * POST /api/commerce/verify-payment
   */
  async verifyPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'احراز هویت الزامی است.' });
      }

      const { orderId, authority, status, refId } = req.body;
      const result = await commerceService.verifyPayment(req.user.userId, {
        orderId,
        authority,
        status,
        refId
      });

      res.json({ success: true, data: result });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get Available Payment Gateways
   * GET /api/commerce/gateways
   */
  async getGateways(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { paymentGatewayRegistry } = await import('../services/paymentProvider.js');
      const gateways = paymentGatewayRegistry.getAvailableGateways();
      res.json({ success: true, data: gateways });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get User Orders
   * GET /api/commerce/orders/my
   */
  async getMyOrders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'احراز هویت الزامی است.' });
      }

      const result = await commerceService.getOrders({
        userId: req.user.userId,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20
      });

      res.json({ success: true, data: result });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get All Orders (Admin)
   * GET /api/commerce/orders
   */
  async getAllOrders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status, search, page, limit } = req.query;
      const result = await commerceService.getOrders({
        status: status as any,
        search: search as string,
        page: Number(page) || 1,
        limit: Number(limit) || 20
      });

      res.json({ success: true, data: result });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get Order by ID
   * GET /api/commerce/orders/:id
   */
  async getOrderById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const order = await commerceService.getOrderById(req.params.id, req.user);
      res.json({ success: true, data: order });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Update Order Status (Admin)
   * PATCH /api/commerce/orders/:id/status
   */
  async updateOrderStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const order = await commerceService.updateOrderStatus(req.params.id, status, req.user!.userId);
      res.json({ success: true, data: order });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get All Coupons (Admin)
   * GET /api/commerce/coupons
   */
  async getCoupons(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const coupons = await commerceService.getCoupons();
      res.json({ success: true, count: coupons.length, data: coupons });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Create Coupon (Admin)
   * POST /api/commerce/coupons
   */
  async createCoupon(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const coupon = await commerceService.createCoupon(req.body);
      res.status(201).json({ success: true, data: coupon });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Update Coupon (Admin)
   * PUT /api/commerce/coupons/:id
   */
  async updateCoupon(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const coupon = await commerceService.updateCoupon(req.params.id, req.body);
      res.json({ success: true, data: coupon });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Delete Coupon (Admin)
   * DELETE /api/commerce/coupons/:id
   */
  async deleteCoupon(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await commerceService.deleteCoupon(req.params.id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Update Course Pricing (Admin No-Code Dynamic Pricing)
   * PUT /api/commerce/courses/:id/pricing
   */
  async updateCoursePricing(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await commerceService.updateCoursePricing(req.params.id, req.body);
      res.json({ success: true, data: result, message: 'قیمت‌گذاری دوره با موفقیت به‌روزرسانی شد.' });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Subscription Plans (Public / Authenticated)
   * GET /api/commerce/subscription-plans
   */
  async getSubscriptionPlans(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const onlyActive = req.query.all === 'true' ? false : true;
      const plans = await commerceService.getSubscriptionPlans(onlyActive);
      res.json({ success: true, data: plans });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Create Subscription Plan (Admin)
   * POST /api/commerce/subscription-plans
   */
  async createSubscriptionPlan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const plan = await commerceService.createSubscriptionPlan(req.body);
      res.status(201).json({ success: true, data: plan });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Update Subscription Plan (Admin)
   * PUT /api/commerce/subscription-plans/:id
   */
  async updateSubscriptionPlan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const plan = await commerceService.updateSubscriptionPlan(req.params.id, req.body);
      res.json({ success: true, data: plan });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Delete Subscription Plan (Admin)
   * DELETE /api/commerce/subscription-plans/:id
   */
  async deleteSubscriptionPlan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await commerceService.deleteSubscriptionPlan(req.params.id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Grant manual subscription to user (Admin)
   * POST /api/commerce/users/:id/grant-subscription
   */
  async grantUserSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const duration = Number(req.body.durationInMonths) as 1 | 3 | 6 | 9;
      const result = await commerceService.grantUserSubscription(req.params.id, duration);
      res.json({ success: true, data: result });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Revoke subscription from user (Admin)
   * POST /api/commerce/users/:id/revoke-subscription
   */
  async revokeUserSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await commerceService.revokeUserSubscription(req.params.id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      next(error);
    }
  }
}

export const commerceController = new CommerceController();
