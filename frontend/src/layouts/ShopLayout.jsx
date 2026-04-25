import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const navItems = [
  { to: '/shop', label: 'Dashboard', icon: '📊' },
  { to: '/shop/products', label: 'Products', icon: '📦' },
  { to: '/shop/stock', label: 'Stock', icon: '🏷️' },
  { to: '/shop/farmers', label: 'Farmers', icon: '👨‍🌾' },
  { to: '/shop/billing', label: 'Billing', icon: '🧾' },
  { to: '/shop/ledger', label: 'Ledger', icon: '📒' },
  { to: '/shop/reports', label: 'Reports', icon: '📈' },
]

export default function ShopLayout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const shopName = user?.shop?.name || 'Shop'

  return (
    <div className="min-h-screen flex bg-surface-100">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''} md:translate-x-0`}>
        <div className="sidebar-brand">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-lg font-bold shadow-md">
              🌾
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-secondary-900 truncate">{shopName}</h2>
              <p className="text-xs text-secondary-400">Shop Admin</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`sidebar-link ${location.pathname === item.to ? 'active' : ''}`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-surface-200">
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-secondary-800 truncate">{user?.name}</p>
              <p className="text-xs text-secondary-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="btn-danger w-full btn-sm">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header (mobile) */}
        <header className="md:hidden bg-white border-b border-surface-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
          >
            <svg className="w-6 h-6 text-secondary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-lg">🌾</span>
            <span className="font-semibold text-secondary-900">{shopName}</span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <section className="animate-fade-in">{children}</section>
        </main>
      </div>
    </div>
  )
}
