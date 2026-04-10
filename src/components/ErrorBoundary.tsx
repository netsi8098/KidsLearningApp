import { Component, type ReactNode } from 'react';
import MascotLion from './svg/MascotLion';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-dvh flex flex-col items-center justify-center p-6 text-center"
          style={{ background: 'linear-gradient(135deg, #FFF8F0, #FFECD2, #FFE0E6)' }}
        >
          <MascotLion size={140} expression="sad" animated />

          <h1 className="font-display text-3xl text-[#2D2D3A] mt-4 mb-2" style={{ textShadow: '0 2px 0 rgba(0,0,0,0.06)' }}>
            Oops! Let&apos;s try again!
          </h1>
          <p className="text-[#6B6B7B] font-bold mb-8 max-w-xs">
            Something didn&apos;t work right. Don&apos;t worry, we can fix it!
          </p>

          <button
            className="px-10 py-4 rounded-2xl font-display text-lg text-white cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #FF6B6B, #FF8C42)',
              boxShadow: '0 4px 0 rgba(0,0,0,0.15), 0 8px 24px rgba(255,107,107,0.3)',
            }}
            onClick={() => {
              this.setState({ hasError: false, error: undefined });
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
