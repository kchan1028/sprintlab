import { Component, type ErrorInfo, type ReactNode } from 'react'
import { backupFilename, downloadText } from '../lib/download'
import { AppDataContext } from '../state/appDataContext'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

/**
 * Catches unexpected rendering errors so the page shows a recovery message
 * instead of going blank. Data in memory can still be downloaded.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static contextType = AppDataContext
  declare context: React.ContextType<typeof AppDataContext>

  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // No error reporting service in v1; the console is the record.
    console.error('SprintLab crashed while rendering', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    const data = this.context?.data
    return (
      <section role="alert" aria-labelledby="crash-title" className="storage-error">
        <h2 id="crash-title">Something went wrong</h2>
        <p>
          SprintLab hit an unexpected error. Your saved data is not affected. Reload the page to continue. If the
          error comes back after reloading, download a copy of your data and report the problem.
        </p>
        <div className="actions">
          <button type="button" onClick={() => window.location.reload()}>
            Reload page
          </button>
          {data && (
            <button type="button" onClick={() => downloadText(backupFilename(), JSON.stringify(data, null, 2))}>
              Download a copy
            </button>
          )}
        </div>
      </section>
    )
  }
}
