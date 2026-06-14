import type { User, UserRole, UserLevel } from '@/types';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  hq_director: 4,
  regional_manager: 3,
  duty_officer: 2,
  inspector: 1,
};

export function hasRole(user: User | null, requiredRole: UserRole): boolean {
  if (!user) return false;
  return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[requiredRole];
}

export function canViewCorridor(
  user: User | null,
  corridor: { province: string; city: string }
): boolean {
  if (!user) return false;

  if (user.level === 'national') return true;
  if (user.level === 'provincial') return user.province === corridor.province;
  if (user.level === 'municipal') {
    return user.province === corridor.province && user.city === corridor.city;
  }
  return false;
}

export function getUserLevelFilter(user: User | null): {
  level: UserLevel | null;
  province?: string;
  city?: string;
} {
  if (!user) return { level: null };
  if (user.level === 'national') return { level: 'national' };
  if (user.level === 'provincial') return { level: 'provincial', province: user.province };
  if (user.level === 'municipal') {
    return { level: 'municipal', province: user.province, city: user.city };
  }
  return { level: null };
}

export function canApproveLevel(user: User | null, approvalLevel: 1 | 2 | 3): boolean {
  if (!user) return false;
  if (approvalLevel === 1) return user.role === 'duty_officer' || hasRole(user, 'regional_manager');
  if (approvalLevel === 2) return user.role === 'regional_manager' || hasRole(user, 'hq_director');
  if (approvalLevel === 3) return user.role === 'hq_director';
  return false;
}
