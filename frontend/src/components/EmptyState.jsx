import React from "react";

export default function EmptyState({ title, message }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">
        {title}
      </h3>
      <p>{message}</p>
    </div>
  );
}
