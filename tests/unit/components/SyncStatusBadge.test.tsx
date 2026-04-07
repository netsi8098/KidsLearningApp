import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { SyncStatus } from '../../../src/hooks/useSync';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, whileHover, whileTap, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
  },
}));

// Mock useSync hook
const mockUseSync = vi.fn();
vi.mock('../../../src/hooks/useSync', () => ({
  useSync: () => mockUseSync(),
}));

import SyncStatusBadge from '../../../src/components/SyncStatusBadge';

describe('SyncStatusBadge', () => {
  function setStatus(status: SyncStatus) {
    mockUseSync.mockReturnValue({
      syncStatus: status,
      lastSyncedAt: null,
      triggerSync: vi.fn(),
      conflicts: 0,
      pendingCount: 0,
    });
  }

  it('renders "Synced" label when status is synced', () => {
    setStatus('synced');
    render(<SyncStatusBadge />);
    expect(screen.getByText('Synced')).toBeInTheDocument();
  });

  it('renders "Syncing..." label when status is syncing', () => {
    setStatus('syncing');
    render(<SyncStatusBadge />);
    expect(screen.getByText('Syncing...')).toBeInTheDocument();
  });

  it('renders "Offline" label when status is offline', () => {
    setStatus('offline');
    render(<SyncStatusBadge />);
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('renders "Sync Error" label when status is error', () => {
    setStatus('error');
    render(<SyncStatusBadge />);
    expect(screen.getByText('Sync Error')).toBeInTheDocument();
  });

  it('hides label when showLabel is false', () => {
    setStatus('synced');
    render(<SyncStatusBadge showLabel={false} />);
    expect(screen.queryByText('Synced')).not.toBeInTheDocument();
  });

  it('shows label by default (showLabel defaults to true)', () => {
    setStatus('offline');
    render(<SyncStatusBadge />);
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('renders the colored dot indicator', () => {
    setStatus('synced');
    const { container } = render(<SyncStatusBadge />);
    // There should be at least one dot (the solid indicator)
    const dots = container.querySelectorAll('.rounded-full.h-2\\.5.w-2\\.5');
    expect(dots.length).toBeGreaterThanOrEqual(1);
  });

  it('renders pulsing animation for syncing status', () => {
    setStatus('syncing');
    const { container } = render(<SyncStatusBadge />);
    // Syncing has pulse=true, so there should be an animate-ping element
    const pingElement = container.querySelector('.animate-ping');
    expect(pingElement).toBeInTheDocument();
  });

  it('renders pulsing animation for error status', () => {
    setStatus('error');
    const { container } = render(<SyncStatusBadge />);
    const pingElement = container.querySelector('.animate-ping');
    expect(pingElement).toBeInTheDocument();
  });

  it('does not render pulsing animation for synced status', () => {
    setStatus('synced');
    const { container } = render(<SyncStatusBadge />);
    const pingElement = container.querySelector('.animate-ping');
    expect(pingElement).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    setStatus('synced');
    const { container } = render(<SyncStatusBadge className="my-sync" />);
    expect(container.querySelector('.my-sync')).toBeInTheDocument();
  });
});
