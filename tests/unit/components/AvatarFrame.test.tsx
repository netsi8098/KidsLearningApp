import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, whileHover, whileTap, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
    circle: (props: any) => {
      const { initial, animate, exit, transition, ...rest } = props;
      return <circle {...rest} />;
    },
  },
}));

import AvatarFrame from '../../../src/components/AvatarFrame';

describe('AvatarFrame', () => {
  it('renders the emoji', () => {
    render(<AvatarFrame emoji="🦊" />);
    expect(screen.getByText('🦊')).toBeInTheDocument();
  });

  it('uses default size "lg" when no size is specified', () => {
    const { container } = render(<AvatarFrame emoji="🦊" />);
    const outerDiv = container.firstChild as HTMLElement;
    // lg size = 96px outer
    expect(outerDiv.style.width).toBe('96px');
    expect(outerDiv.style.height).toBe('96px');
  });

  it('renders with "sm" size (48px)', () => {
    const { container } = render(<AvatarFrame emoji="🐱" size="sm" />);
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv.style.width).toBe('48px');
    expect(outerDiv.style.height).toBe('48px');
  });

  it('renders with "md" size (72px)', () => {
    const { container } = render(<AvatarFrame emoji="🐱" size="md" />);
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv.style.width).toBe('72px');
    expect(outerDiv.style.height).toBe('72px');
  });

  it('renders with "xl" size (128px)', () => {
    const { container } = render(<AvatarFrame emoji="🐱" size="xl" />);
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv.style.width).toBe('128px');
    expect(outerDiv.style.height).toBe('128px');
  });

  it('renders badge when provided', () => {
    render(<AvatarFrame emoji="🦊" badge="⭐" />);
    expect(screen.getByText('⭐')).toBeInTheDocument();
  });

  it('does not render badge when not provided', () => {
    render(<AvatarFrame emoji="🦊" />);
    expect(screen.queryByText('⭐')).not.toBeInTheDocument();
  });

  it('renders spotlight glow when spotlight prop is true', () => {
    const { container } = render(<AvatarFrame emoji="🦊" spotlight={true} />);
    // Spotlight creates an extra div with absolute inset-[-6px]
    const spotlightDiv = container.querySelector('.absolute.inset-\\[-6px\\]');
    expect(spotlightDiv).toBeInTheDocument();
  });

  it('does not render spotlight glow when spotlight is false', () => {
    const { container } = render(<AvatarFrame emoji="🦊" spotlight={false} />);
    const spotlightDiv = container.querySelector('.absolute.inset-\\[-6px\\]');
    expect(spotlightDiv).not.toBeInTheDocument();
  });

  it('renders SVG frame element', () => {
    const { container } = render(<AvatarFrame emoji="🦊" frameType="basic" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<AvatarFrame emoji="🦊" className="my-avatar" />);
    expect(container.querySelector('.my-avatar')).toBeInTheDocument();
  });
});
