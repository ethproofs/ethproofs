"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"

import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class WasmErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      "[WasmErrorBoundary] WASM operation failed:",
      error,
      errorInfo
    )
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">WASM verification failed</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => this.setState({ hasError: false, error: undefined })}
          >
            Try again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

export default WasmErrorBoundary
