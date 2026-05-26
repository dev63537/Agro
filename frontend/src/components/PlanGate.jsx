import React from 'react';
import { Link } from 'react-router-dom';
import { usePlan } from '../hooks/usePlan';

/**
 * PlanGate — renders children only if the shop's plan meets the requirement.
 * Otherwise shows a premium upgrade prompt card.
 * #19 Role-Based Plan Tiers
 *
 * Usage:
 *   <PlanGate feature="export">
 *     <ExportButton />
 *   </PlanGate>
 */
const PLAN_NAMES = { FREE: 'Free', BASIC: 'Basic', PRO: 'Pro' };
const PLAN_EMOJI = { FREE: '🆓', BASIC: '⭐', PRO: '🚀' };

const FEATURE_PLAN_MAP = {
  reports:            'BASIC',
  'bulk-pay':         'BASIC',
  history:            'BASIC',
  returns:            'BASIC',
  notifications:      'BASIC',
  export:             'PRO',
  'farmer-statement': 'PRO',
  'audit-log':        'PRO',
};

export default function PlanGate({ feature, children, fallback }) {
  const { can, plan } = usePlan();

  if (can(feature)) return children;

  const required = FEATURE_PLAN_MAP[feature] || 'BASIC';

  if (fallback) return fallback;

  return (
    <div className="card border-2 border-dashed border-amber-300 bg-amber-50/50">
      <div className="card-body text-center py-10">
        <div className="text-5xl mb-3">🔒</div>
        <h3 className="text-lg font-bold text-secondary-800 mb-1">
          {PLAN_EMOJI[required]} {PLAN_NAMES[required]} Plan Required
        </h3>
        <p className="text-sm text-secondary-500 mb-1">
          This feature requires the <strong className="text-amber-600">{PLAN_NAMES[required]}</strong> plan.
        </p>
        <p className="text-xs text-secondary-400 mb-5">
          You are currently on the <strong>{PLAN_NAMES[plan] || plan}</strong> plan.
        </p>
        <div className="flex items-center justify-center gap-3">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm">
            <span>✨</span>
            <span>Upgrade to {PLAN_NAMES[required]}</span>
          </div>
        </div>
        <p className="text-xs text-secondary-400 mt-4">
          Contact your administrator to upgrade your plan.
        </p>
      </div>
    </div>
  );
}
