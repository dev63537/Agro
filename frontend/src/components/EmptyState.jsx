import React from 'react'

export default function EmptyState({ title, message, action, actionLabel, icon }) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state-icon">{icon}</div>}
      <div className="empty-state-title">{title}</div>
      <div className="empty-state-message">{message}</div>
      {action && actionLabel && (
        <button onClick={action} className="btn-primary mt-2">
          {actionLabel}
        </button>
      )}
    </div>
  )
}
