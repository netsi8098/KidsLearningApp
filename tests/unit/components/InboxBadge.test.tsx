import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    span: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, whileHover, whileTap, ...rest } = props;
      return <span {...rest}>{children}</span>;
    },
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock useInbox hook
const mockUseInbox = vi.fn();
vi.mock('../../../src/hooks/useInbox', () => ({
  useInbox: () => mockUseInbox(),
}));

import InboxBadge from '../../../src/components/InboxBadge';

describe('InboxBadge', () => {
  it('renders inbox emoji', () => {
    mockUseInbox.mockReturnValue({ unreadCount: 0 });
    render(<InboxBadge />);
    expect(screen.getByText('📬')).toBeInTheDocument();
  });

  it('does not show count badge when unreadCount is 0', () => {
    mockUseInbox.mockReturnValue({ unreadCount: 0 });
    const { container } = render(<InboxBadge />);
    // The count badge has specific positioning classes
    const countBadge = container.querySelector('.-top-1.-right-1');
    expect(countBadge).not.toBeInTheDocument();
  });

  it('shows count badge when unreadCount is greater than 0', () => {
    mockUseInbox.mockReturnValue({ unreadCount: 5 });
    render(<InboxBadge />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows exact count for values under 100', () => {
    mockUseInbox.mockReturnValue({ unreadCount: 42 });
    render(<InboxBadge />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('shows "99+" for unreadCount over 99', () => {
    mockUseInbox.mockReturnValue({ unreadCount: 150 });
    render(<InboxBadge />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('shows exact count for unreadCount of exactly 99', () => {
    mockUseInbox.mockReturnValue({ unreadCount: 99 });
    render(<InboxBadge />);
    expect(screen.getByText('99')).toBeInTheDocument();
  });

  it('shows "99+" for unreadCount of exactly 100', () => {
    mockUseInbox.mockReturnValue({ unreadCount: 100 });
    render(<InboxBadge />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('shows count badge for unreadCount of 1', () => {
    mockUseInbox.mockReturnValue({ unreadCount: 1 });
    render(<InboxBadge />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    mockUseInbox.mockReturnValue({ unreadCount: 0 });
    const { container } = render(<InboxBadge className="my-inbox" />);
    expect(container.querySelector('.my-inbox')).toBeInTheDocument();
  });
});
