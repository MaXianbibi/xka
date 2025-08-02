'use client'

import { Alert } from './index'

interface DatabaseAlertProps {
  isVisible: boolean
  onRetry?: () => void
  delay?: number
}

export function DatabaseAlert({ isVisible, onRetry, delay = 1000 }: DatabaseAlertProps) {
  return (
    <Alert
      isVisible={isVisible}
      onRetry={onRetry}
      delay={delay}
      variant="warning"
      title="Base de données non disponible"
      description="Démarrez PostgreSQL avec docker-compose up"
    />
  )
}