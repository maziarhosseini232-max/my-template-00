import { User, UserRole } from '../types';

export const GUEST_USER: User = {
  id: '',
  name: 'کاربر مهمان',
  email: '',
  phone: '',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  role: 'student',
  roles: ['STUDENT'],
  headline: 'عضو مهمان لومینا لرن',
  bio: '',
  joinedDate: '',
  walletBalance: 0,
  enrolledCourseIds: [],
  wishlistCourseIds: [],
  followedInstructorIds: []
};

export function mapServerUserToClientUser(serverUser: any): User {
  if (!serverUser) return GUEST_USER;

  const roles: string[] = serverUser.roles || [];
  let role: UserRole = 'student';
  if (roles.includes('OWNER') || roles.includes('ADMIN') || serverUser.role === 'admin' || serverUser.role === 'superadmin') {
    role = 'admin';
  } else if (roles.includes('INSTRUCTOR') || serverUser.role === 'instructor') {
    role = 'instructor';
  }

  let joinedDate = serverUser.joinedDate;
  if (!joinedDate && serverUser.createdAt) {
    try {
      joinedDate = new Date(serverUser.createdAt).toLocaleDateString('fa-IR');
    } catch {
      joinedDate = '۱۴۰۴/۱۱/۰۱';
    }
  }

  return {
    id: serverUser.id || `usr_${Date.now()}`,
    name: serverUser.name || 'کاربر لومینا',
    email: serverUser.email || '',
    phone: serverUser.phone || '',
    avatar: serverUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role,
    roles: roles.length > 0 ? roles : [role.toUpperCase()],
    headline: serverUser.headline || '',
    bio: serverUser.bio || '',
    shebaNumber: serverUser.shebaNumber || '',
    joinedDate: joinedDate || 'امروز',
    walletBalance: typeof serverUser.walletBalance === 'number' ? serverUser.walletBalance : 0,
    isEmailVerified: !!serverUser.isEmailVerified,
    isPhoneVerified: !!serverUser.isPhoneVerified,
    isActive: serverUser.isActive !== false,
    subscriptionEndDate: serverUser.subscriptionEndDate || null,
    createdAt: serverUser.createdAt,
    enrolledCourseIds: Array.isArray(serverUser.enrolledCourseIds) ? serverUser.enrolledCourseIds : [],
    wishlistCourseIds: Array.isArray(serverUser.wishlistCourseIds) ? serverUser.wishlistCourseIds : [],
    followedInstructorIds: Array.isArray(serverUser.followedInstructorIds) ? serverUser.followedInstructorIds : []
  };
}

export function getStoredAuthToken(): string | null {
  return localStorage.getItem('lumina_auth_token');
}

export function setStoredAuthToken(token: string): void {
  localStorage.setItem('lumina_auth_token', token);
}

export function clearStoredAuthToken(): void {
  localStorage.removeItem('lumina_auth_token');
}
