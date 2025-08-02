'use client'

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-900/20 border border-red-600/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-red-400 font-medium text-sm mb-2">
                Erreur de chargement
              </h3>
              <p className="text-red-300/80 text-xs mb-4">
                {this.state.error?.message || 'Une erreur inattendue s\'est produite.'}
              </p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-800/30 hover:bg-red-800/50 border border-red-600/30 rounded text-red-200 text-xs transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                Réessayer
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}