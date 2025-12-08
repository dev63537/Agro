import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ShopLayout({ children }) {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-white border-r p-4">
        <h2 className="text-xl font-bold mb-4">Shop Admin</h2>
        <nav className="space-y-2">
          <Link to="/shop" className="block p-2 rounded hover:bg-gray-100">Dashboard</Link>
          <Link to="/shop/products" className="block p-2 rounded hover:bg-gray-100">Products</Link>
          <Link to="/shop/stock" className="block p-2 rounded hover:bg-gray-100">Stock Batches</Link>
          <Link to="/shop/farmers" className="block p-2 rounded hover:bg-gray-100">Farmers</Link>
          <Link to="/shop/billing" className="block p-2 rounded hover:bg-gray-100">Billing</Link>
          <Link to="/shop/ledger" className="block p-2 rounded hover:bg-gray-100">Ledger</Link>
          <Link to="/shop/reports" className="block p-2 rounded hover:bg-gray-100">Reports</Link>
        </nav>
        <div className="mt-6">
          <button onClick={logout} className="btn-danger w-full">Logout</button>
        </div>
      </aside>
      <main className="flex-1 p-6 bg-gray-50">
        <header className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Shop Dashboard</h1>
            <div>{user?.name}</div>
          </div>
        </header>
        <section>{children}</section>
      </main>
    </div>
  )
}
