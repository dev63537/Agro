import React from "react";
import { useAuth } from "../hooks/useAuth";

export default function ShopBlocked({ reason }) {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow max-w-md text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Access Blocked
        </h2>

        <p className="text-gray-700 mb-6">
          {reason ||
            "Your shop is currently not allowed to access the system."}
        </p>

        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
