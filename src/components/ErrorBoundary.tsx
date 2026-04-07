import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-dvh bg-cream flex flex-col items-center justify-center p-6 text-center">
          <div className="text-7xl mb-4">🛠️</div>
          <h1 className="text-2xl font-bold text-gray-700 mb-2">Oops! Something went wrong</h1>
          <p className="text-gray-500 mb-6">Don&apos;t worry, let&apos;s try again!</p>
          <button
            className="bg-coral text-white rounded-2xl px-8 py-3 font-bold shadow-lg cursor-pointer"
            onClick={() => {
              this.setState({ hasError: false });
              window.location.href = '/';
            }}
          >
            🏠 Go Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
