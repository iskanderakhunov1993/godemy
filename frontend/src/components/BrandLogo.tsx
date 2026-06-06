import React from 'react'

interface BrandLogoProps {
  className?: string
  compact?: boolean
}

export function BrandLogo({ className = '', compact = false }: BrandLogoProps) {
  const sizeClass = compact ? 'text-base sm:text-lg' : 'text-2xl'

  return (
    <span
      className={`inline-flex items-center font-mono font-medium ${sizeClass} ${className}`}
      aria-label="godemy"
    >
      <span className="text-cyan-400">[</span>
      <span className="ml-1 tracking-[0.02em] text-gray-100">godemy</span>
      <span className="text-cyan-400">_</span>
    </span>
  )
}
