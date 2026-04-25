import React from "react";
import { useAuth } from "../hooks/useAuth";

export default function ShopBlocked({ reason }) {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="card max-w-md w-full text-center">
        <div className="card-body py-10">
          <div className="text-5xl mb-4">🚫</div>
          <h2 className="text-xl font-bold text-red-600 mb-3">
            Access Blocked
          </h2>
          <p className="text-secondary-600 mb-6">
            {reason || "Your shop is currently not allowed to access the system."}
          </p>
          <button onClick={logout} className="btn-danger">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
