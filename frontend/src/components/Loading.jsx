import React from 'react'

export function LoadingSpinner({ size = 'md' }) {
  const dim = { sm: 20, md: 36, lg: 52 }[size]
  return (
    <div className="flex items-center justify-center">
      <div
        style={{
          width: dim, height: dim,
          border: '3px solid rgba(99,102,241,0.2)',
          borderTopColor: '#6366f1',
          borderRadius: '50%',
          animation: 'spin 0.75s linear infinite',
        }}
      />
    </div>
  )
}

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#0a0a0f' }}>
      <div className="text-center space-y-5">
        {/* Animated rings */}
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-full"
            style={{ border: '3px solid rgba(99,102,241,0.15)', animation: 'spin 3s linear infinite' }} />
          <div className="absolute inset-2 rounded-full"
            style={{ border: '3px solid transparent', borderTopColor: '#8b5cf6', animation: 'spin 1.5s linear infinite' }} />
          <div className="absolute inset-4 rounded-full"
            style={{ border: '3px solid transparent', borderTopColor: '#6366f1', animation: 'spin 0.75s linear infinite reverse' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }} />
          </div>
        </div>
        <div>
          <p className="text-slate-300 font-semibold text-lg">Loading</p>
          <p className="text-slate-600 text-sm mt-1">Fetching products for you…</p>
        </div>
      </div>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="skeleton h-52 rounded-none" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-3 w-1/3 rounded-full" />
        <div className="skeleton h-4 w-3/4 rounded-full" />
        <div className="skeleton h-3 w-full rounded-full" />
        <div className="skeleton h-3 w-2/3 rounded-full" />
        <div className="flex justify-between items-center pt-2">
          <div className="skeleton h-6 w-20 rounded-full" />
          <div className="skeleton h-10 w-10 rounded-full" style={{ borderRadius: '50%' }} />
        </div>
      </div>
    </div>
  )
}
