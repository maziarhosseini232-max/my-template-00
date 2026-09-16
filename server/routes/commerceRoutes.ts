import { Router } from 'express';
import { commerceController } from '../controllers/commerceController.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

// 1. Coupons Validation (Public / Authenticated)
router.post('/coupons/validate', commerceController.validateCoupon);

// 2. Checkout & Orders (Student / Authenticated)
router.post('/checkout', authenticate, commerceController.checkout);
router.post('/verify-payment', authenticate, commerceController.verifyPayment);
router.get('/gateways', authenticate, commerceController.getGateways);
router.get('/orders/my', authenticate, commerceController.getMyOrders);
router.get('/orders/:id', authenticate, commerceController.getOrderById);

// 3. Admin Order Management
router.get('/orders', authenticate, requirePermission('commerce:manage'), commerceController.getAllOrders);
router.patch('/orders/:id/status', authenticate, requirePermission('commerce:manage'), logAudit('UPDATE_STATUS', 'ORDER'), commerceController.updateOrderStatus);

// 4. Admin Coupon Management
router.get('/coupons', authenticate, requirePermission('commerce:manage'), commerceController.getCoupons);
router.post('/coupons', authenticate, requirePermission('commerce:manage'), logAudit('CREATE', 'COUPON'), commerceController.createCoupon);
router.put('/coupons/:id', authenticate, requirePermission('commerce:manage'), logAudit('UPDATE', 'COUPON'), commerceController.updateCoupon);
router.delete('/coupons/:id', authenticate, requirePermission('commerce:manage'), logAudit('DELETE', 'COUPON'), commerceController.deleteCoupon);

// 5. Admin Dynamic Pricing Management
router.put('/courses/:id/pricing', authenticate, requirePermission('pricing:manage'), logAudit('UPDATE_PRICING', 'COURSE'), commerceController.updateCoursePricing);

// 6. VIP Subscription Plans & User Grants
router.get('/subscription-plans', commerceController.getSubscriptionPlans);
router.post('/subscription-plans', authenticate, requirePermission('commerce:manage'), logAudit('CREATE', 'SUBSCRIPTION_PLAN'), commerceController.createSubscriptionPlan);
router.put('/subscription-plans/:id', authenticate, requirePermission('commerce:manage'), logAudit('UPDATE', 'SUBSCRIPTION_PLAN'), commerceController.updateSubscriptionPlan);
router.delete('/subscription-plans/:id', authenticate, requirePermission('commerce:manage'), logAudit('DELETE', 'SUBSCRIPTION_PLAN'), commerceController.deleteSubscriptionPlan);

router.post('/users/:id/grant-subscription', authenticate, requirePermission('users:manage'), logAudit('GRANT_SUBSCRIPTION', 'USER'), commerceController.grantUserSubscription);
router.post('/users/:id/revoke-subscription', authenticate, requirePermission('users:manage'), logAudit('REVOKE_SUBSCRIPTION', 'USER'), commerceController.revokeUserSubscription);

export default router;
