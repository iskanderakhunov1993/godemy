'use client'

import { useEffect, useRef } from 'react'

/** Applies a CSS translateY parallax to the element's background/children based on scroll. */
export function ParallaxSection({
  children,
  speed = 0.3,
  className = '',
}: {
  children: React.ReactNode
  speed?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let raf = 0
    const handleScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        if (!el) return
        const rect = el.getBoundingClientRect()
        const viewH = window.innerHeight
        const center = rect.top + rect.height / 2 - viewH / 2
        el.style.setProperty('--parallax-y', `${center * speed}px`)
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      cancelAnimationFrame(raf)
    }
  }, [speed])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

/** Fade-in + slide-up on scroll into view */
export function FadeInSection({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    el.style.opacity = '0'
    el.style.transform = 'translateY(28px)'
    el.style.transition = `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
