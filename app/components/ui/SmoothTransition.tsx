import { useState, useEffect, ReactNode } from 'react'

interface SmoothTransitionProps {
  show: boolean
  children: ReactNode
  delay?: number
  className?: string
}

export function SmoothTransition({ 
  show, 
  children, 
  delay = 500,
  className = '' 
}: SmoothTransitionProps) {
  const [shouldRender, setShouldRender] = useState(show)
  const [isVisible, setIsVisible] = useState(show)

  useEffect(() => {
    if (show) {
      setShouldRender(true)
      // Petit délai pour permettre le rendu avant l'animation
      const timer = setTimeout(() => setIsVisible(true), 10)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
      // Attendre la fin de l'animation avant de démonter
      const timer = setTimeout(() => setShouldRender(false), delay)
      return () => clearTimeout(timer)
    }
  }, [show, delay])

  if (!shouldRender) return null

  return (
    <div
      className={`transition-all duration-300 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      } ${className}`}
    >
      {children}
    </div>
  )
}