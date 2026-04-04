import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'

/**
 * Properties accepted by the ErrorBoundary.
 * It wraps children nodes seamlessly.
 */
interface Props {
    children?: ReactNode
}

/**
 * Internal state for the ErrorBoundary to track if a crash has occurred.
 */
interface State {
    hasError: boolean
}

/**
 * Global Error Boundary Component.
 * Intercepts uncaught layout crashes or network chunk loading failures
 * (like when a lazy-loaded route from App.tsx breaks) and renders a clean UI fallback.
 */
export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    }

    /**
     * Standard React lifecycle method invoked after an error is thrown.
     * Modifies state to immediately trigger the fallback UI rendering.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public static getDerivedStateFromError(_: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true }
    }

    /**
     * Standard React lifecycle method for catching and logging the actual 
     * stack trace to an external logging service or developer console.
     */
    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught component error (Lazy Load Failure):', error, errorInfo)
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground text-center">
                    <h1 className="text-4xl font-bold mb-4">Something went wrong.</h1>
                    <p className="text-muted-foreground mb-6 max-w-md">
                        We couldn't load this page. This typically happens if your internet connection dropped, or if there was a new update to the application while you were browsing.
                    </p>
                    <Button onClick={() => window.location.reload()}>
                        Reload Page
                    </Button>
                </div>
            )
        }

        return this.props.children
    }
}
