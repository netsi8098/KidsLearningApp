import { Component, type ErrorInfo, type ReactNode } from 'react';

interface RiggedLionBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface RiggedLionBoundaryState {
  failed: boolean;
}

export default class RiggedLionBoundary extends Component<RiggedLionBoundaryProps, RiggedLionBoundaryState> {
  state: RiggedLionBoundaryState = { failed: false };

  static getDerivedStateFromError(): RiggedLionBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Rigged lion runtime failed; keeping the temporary articulated fallback visible.', error, info);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
