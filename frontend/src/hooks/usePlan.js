import { useAuth } from './useAuth';

/**
 * usePlan — returns helpers for checking the current shop's plan.
 * #19 Role-Based Plan Tiers
 */
const PLAN_LEVELS = { FREE: 0, BASIC: 1, PRO: 2 };

export function usePlan() {
  const { user } = useAuth();
  const plan = (user?.shop?.plan || user?.plan || 'FREE').toUpperCase();
  const level = PLAN_LEVELS[plan] ?? 0;

  return {
    plan,
    level,
    isFree:  level === 0,
    isBasic: level >= 1,
    isPro:   level >= 2,
    can: (feature) => {
      const req = {
        billing: 0, ledger: 0, farmers: 0, products: 0, stock: 0,
        reports: 1, 'bulk-pay': 1, history: 1, returns: 1, notifications: 1,
        export: 2, 'farmer-statement': 2, 'audit-log': 2,
      };
      return level >= (req[feature] ?? 0);
    },
  };
}
