import React from 'react'

interface BrandLogoProps {
  className?: string
  compact?: boolean
}

export function BrandLogo({ className = '', compact = false }: BrandLogoProps) {
  const sizeClass = compact ? 'text-base sm:text-lg' : 'text-[1.75rem]'

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-semibold tracking-[-0.03em] ${sizeClass} ${className}`}
      aria-label="godemy"
    >
      <span className="text-violet-400">[</span>
      <span className="text-white">godemy</span>
      <span className="text-cyan-300">_</span>
    </span>
  )
}
