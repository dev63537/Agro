import React from "react";

const colorMap = {
  green: { bg: 'bg-primary-50', border: 'border-primary-200', icon: 'bg-primary-100 text-primary-600', value: 'text-primary-700' },
  blue: { bg: 'bg-info-50', border: 'border-info-200', icon: 'bg-info-100 text-info-600', value: 'text-info-700' },
  orange: { bg: 'bg-accent-50', border: 'border-accent-200', icon: 'bg-accent-100 text-accent-600', value: 'text-accent-700' },
  red: { bg: 'bg-red-50', border: 'border-red-200', icon: 'bg-red-100 text-red-600', value: 'text-red-700' },
};

export default function StatCard({ title, value, icon, color = 'green', subtitle, trend }) {
  const c = colorMap[color] || colorMap.green;

  return (
    <div className={`card border ${c.border} ${c.bg} hover:shadow-card-hover`}>
      <div className="card-body">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-secondary-500 uppercase tracking-wider">{title}</p>
            <div className="flex items-center gap-2 mt-1">
              <p className={`text-2xl font-bold ${c.value}`}>{value}</p>
              {trend && (
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                  trend === 'up'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {trend === 'up' ? '↑' : '↓'}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-secondary-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div className={`w-12 h-12 rounded-xl ${c.icon} flex items-center justify-center text-2xl flex-shrink-0`}>
              {icon}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
