import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function MasterLayout({ children }) {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-white border-r p-4">
        <h2 className="text-xl font-bold mb-4">Master Admin</h2>
        <nav className="space-y-2">
          <Link to="/master" className="block p-2 rounded hover:bg-gray-100">Dashboard</Link>
          <Link to="/master/shops" className="block p-2 rounded hover:bg-gray-100">Shops</Link>
          <Link to="/master/shops/create" className="block p-2 rounded hover:bg-gray-100">Create Shop</Link>
        </nav>
        <div className="mt-6">
          <button onClick={logout} className="btn-danger w-full">Logout</button>
        </div>
      </aside>
      <main className="flex-1 p-6 bg-gray-50">
        <header className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Agro Billing SaaS</h1>
            <div>{user?.name}</div>
          </div>
        </header>
        <section>{children}</section>
      </main>
    </div>
  )
}
