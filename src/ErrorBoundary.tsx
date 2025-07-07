import { Component, ErrorInfo, ReactNode } from 'react';
import { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { ErrorBoundary } from "react-error-boundary";


interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}


interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  state = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-100 text-red-800">
          <h2>Something went wrong</h2>
          <p>Please refresh the page or try again later.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Wrap your component
<ErrorBoundary>
  <CRMDashboard />
</ErrorBoundary>

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive" className="my-4">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {this.state.error?.message || 'Something went wrong'}
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="p-4 bg-red-100 border border-red-400 rounded">
      <p className="font-bold text-red-700">Something went wrong:</p>
      <pre className="text-red-600">{error.message}</pre>
      <button 
        onClick={resetErrorBoundary}
        className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Try again
      </button>
    </div>
  );
}

// Wrap your components
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <CRMDashboard />
</ErrorBoundary>