/**
 * ProtectedRoute — guards routes that require an active player profile.
 * Redirects to splash (/) if no player is selected.
 * Also wraps each route in its own error boundary so a failed
 * lazy chunk doesn't crash the entire app.
 */
import { type ReactNode, Component } from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import MascotLion from './svg/MascotLion';

interface RouteErrorBoundaryProps {
  children: ReactNode;
}

interface RouteErrorBoundaryState {
  hasError: boolean;
}

/** Per-route error boundary — isolates chunk load failures */
class RouteErrorBoundary extends Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
  constructor(props: RouteErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): RouteErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('[RouteErrorBoundary]', error.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-dvh flex flex-col items-center justify-center p-6 text-center" style={{ background: 'linear-gradient(135deg, #FFF8F0, #FFECD2)' }}>
          <MascotLion size={100} expression="sad" animated />
          <h2 className="font-display text-2xl text-[#2D2D3A] mt-4 mb-2">Oops! Something broke</h2>
          <p className="text-[#6B6B7B] font-bold mb-6 max-w-xs">This page had a problem loading. Let&apos;s go back home!</p>
          <button
            className="btn-primary text-lg"
            onClick={() => {
              this.setState({ hasError: false });
              window.location.href = '/';
            }}
          >
            Go Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/** Requires active player — redirects to splash if none */
function RequirePlayer({ children }: { children: ReactNode }) {
  const { currentPlayer } = useApp();
  if (!currentPlayer) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

/** Wraps a route element with error boundary + player check */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  return (
    <RouteErrorBoundary>
      <RequirePlayer>{children}</RequirePlayer>
    </RouteErrorBoundary>
  );
}

/** Wraps a route element with error boundary only (no player check) */
export function SafeRoute({ children }: { children: ReactNode }) {
  return (
    <RouteErrorBoundary>{children}</RouteErrorBoundary>
  );
}
