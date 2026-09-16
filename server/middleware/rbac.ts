import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';
import { db, ROLES } from '../db/index.js';
import { UserRoleType } from '../db/schema.js';

export function requireRole(allowedRoles: UserRoleType[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'احراز هویت الزامی است.' });
      return;
    }

    const hasRole = req.user.roles.some(role => allowedRoles.includes(role));
    if (!hasRole) {
      res.status(403).json({
        success: false,
        message: 'شما دسترسی لازم برای این عملیات را ندارید.'
      });
      return;
    }

    next();
  };
}

export function requirePermission(permissionName: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'احراز هویت الزامی است.' });
      return;
    }

    // Check permissions granted to user's roles
    const userRoles = req.user.roles;
    let hasPermission = false;

    for (const roleName of userRoles) {
      const roleDef = ROLES.find(r => r.name === roleName);
      if (roleDef && roleDef.permissions.includes(permissionName)) {
        hasPermission = true;
        break;
      }
    }

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        message: `دسترسی غیرمجاز: نیاز به مجوز "${permissionName}" دارید.`
      });
      return;
    }

    next();
  };
}

/**
 * VIP Subscription Guard
 * Verifies user has an active, non-expired VIP subscription (or is Admin/Owner)
 */
export function requireVipSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ 
      success: false, 
      code: 'UNAUTHORIZED',
      message: 'احراز هویت الزامی است. لطفاً ابتدا وارد حساب کاربری خود شوید.' 
    });
    return;
  }

  if (req.user.roles.includes('OWNER') || req.user.roles.includes('ADMIN')) {
    next();
    return;
  }

  const user = db.users.find(u => u.id === req.user!.userId && !u.deletedAt);
  const isVipActive = !!(
    user?.subscriptionEndDate && 
    new Date(user.subscriptionEndDate).getTime() > Date.now()
  );

  if (!isVipActive) {
    res.status(403).json({
      success: false,
      code: 'FORBIDDEN_SUBSCRIPTION_REQUIRED',
      message: 'دسترسی نیازمند اشتراک ویژه (VIP) فعال است. لطفاً اشتراک خود را فعال یا تمدید فرمایید.'
    });
    return;
  }

  next();
}
