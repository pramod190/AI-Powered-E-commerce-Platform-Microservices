import React, { useState, useEffect } from 'react'
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi'

const TYPES = {
  success: {
    icon: FiCheckCircle,
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.1)',
    border: 'rgba(34,197,94,0.25)',
  },
  error: {
    icon: FiAlertCircle,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.25)',
  },
  info: {
    icon: FiInfo,
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.1)',
    border: 'rgba(99,102,241,0.25)',
  },
}

export function Alert({ type = 'info', message, onClose, autoClose = 5000 }) {
  const [visible, setVisible] = useState(true)
  const style = TYPES[type] || TYPES.info
  const Icon = style.icon

  useEffect(() => {
    if (autoClose && onClose) {
      const t = setTimeout(() => { setVisible(false); onClose() }, autoClose)
      return () => clearTimeout(t)
    }
  }, [autoClose, onClose])

  if (!visible || !message) return null

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm w-full animate-slideDown"
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: 16,
        backdropFilter: 'blur(20px)',
        padding: '1rem 1.25rem',
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${style.bg}`,
      }}>
      <div className="flex items-start gap-3">
        <Icon size={20} style={{ color: style.color, flexShrink: 0, marginTop: 1 }} />
        <p className="text-sm text-slate-200 flex-1 font-medium leading-relaxed">{message}</p>
        {onClose && (
          <button onClick={() => { setVisible(false); onClose() }}
            className="text-slate-500 hover:text-white transition-colors flex-shrink-0">
            <FiX size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
