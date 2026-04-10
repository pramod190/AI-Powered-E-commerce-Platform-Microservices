import React from 'react'

export function LoadingSpinner({ size = 'md' }) {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }[size]

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClass} border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin`} />
    </div>
  )
}

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
