import React from 'react'
import { FiAlertCircle, FiCheckCircle, FiX } from 'react-icons/fi'

export function Alert({ type = 'info', title, message, onClose }) {
  const colors = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  }

  const icons = {
    info: <FiAlertCircle size={20} />,
    success: <FiCheckCircle size={20} />,
    error: <FiAlertCircle size={20} />,
    warning: <FiAlertCircle size={20} />,
  }

  return (
    <div className={`border rounded-lg p-4 flex items-start justify-between ${colors[type]}`}>
      <div className="flex items-start gap-3">
        {icons[type]}
        <div>
          {title && <h4 className="font-semibold">{title}</h4>}
          {message && <p className="text-sm mt-1">{message}</p>}
        </div>
      </div>
      {onClose && (
        <button onClick={onClose} className="ml-4">
          <FiX size={20} />
        </button>
      )}
    </div>
  )
}
