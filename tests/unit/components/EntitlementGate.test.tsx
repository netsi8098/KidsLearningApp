import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EntitlementGate from '../../../src/components/EntitlementGate';

let mockHasEntitlement = vi.fn();

vi.mock('../../../src/hooks/useEntitlement', () => ({
  useEntitlement: () => ({
    hasEntitlement: mockHasEntitlement,
  }),
}));

// Mock UpgradePrompt since it uses framer-motion and useNavigate
vi.mock('../../../src/components/UpgradePrompt', () => ({
  default: ({ feature }: { feature?: string }) => (
    <div data-testid="upgrade-prompt">Upgrade Prompt for {feature}</div>
  ),
}));

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('EntitlementGate', () => {
  beforeEach(() => {
    mockHasEntitlement = vi.fn();
  });

  describe('when entitled', () => {
    beforeEach(() => {
      mockHasEntitlement.mockReturnValue(true);
    });

    it('renders children when user has entitlement', () => {
      renderWithRouter(
        <EntitlementGate feature="all_content">
          <div data-testid="premium-content">Premium Content</div>
        </EntitlementGate>
      );

      expect(screen.getByTestId('premium-content')).toBeInTheDocument();
      expect(screen.getByText('Premium Content')).toBeInTheDocument();
    });

    it('does not render fallback when entitled', () => {
      renderWithRouter(
        <EntitlementGate
          feature="all_content"
          fallback={<div data-testid="fallback">Fallback</div>}
        >
          <div data-testid="premium-content">Premium Content</div>
        </EntitlementGate>
      );

      expect(screen.getByTestId('premium-content')).toBeInTheDocument();
      expect(screen.queryByTestId('fallback')).not.toBeInTheDocument();
    });

    it('does not render UpgradePrompt when entitled', () => {
      renderWithRouter(
        <EntitlementGate feature="offline_packs">
          <div>Content</div>
        </EntitlementGate>
      );

      expect(screen.queryByTestId('upgrade-prompt')).not.toBeInTheDocument();
    });

    it('calls hasEntitlement with correct feature', () => {
      renderWithRouter(
        <EntitlementGate feature="custom_routines">
          <div>Content</div>
        </EntitlementGate>
      );

      expect(mockHasEntitlement).toHaveBeenCalledWith('custom_routines');
    });
  });

  describe('when not entitled', () => {
    beforeEach(() => {
      mockHasEntitlement.mockReturnValue(false);
    });

    it('renders fallback when not entitled and fallback is provided', () => {
      renderWithRouter(
        <EntitlementGate
          feature="all_content"
          fallback={<div data-testid="fallback">Limited Content</div>}
        >
          <div data-testid="premium-content">Premium Content</div>
        </EntitlementGate>
      );

      expect(screen.getByTestId('fallback')).toBeInTheDocument();
      expect(screen.getByText('Limited Content')).toBeInTheDocument();
      expect(screen.queryByTestId('premium-content')).not.toBeInTheDocument();
    });

    it('renders UpgradePrompt when not entitled and no fallback provided', () => {
      renderWithRouter(
        <EntitlementGate feature="offline_packs">
          <div data-testid="premium-content">Premium Content</div>
        </EntitlementGate>
      );

      expect(screen.getByTestId('upgrade-prompt')).toBeInTheDocument();
      expect(screen.queryByTestId('premium-content')).not.toBeInTheDocument();
    });

    it('passes feature to UpgradePrompt', () => {
      renderWithRouter(
        <EntitlementGate feature="advanced_reports">
          <div>Content</div>
        </EntitlementGate>
      );

      expect(screen.getByText('Upgrade Prompt for advanced_reports')).toBeInTheDocument();
    });

    it('does not render children when not entitled', () => {
      renderWithRouter(
        <EntitlementGate feature="priority_support">
          <div data-testid="premium-content">Premium Content</div>
        </EntitlementGate>
      );

      expect(screen.queryByTestId('premium-content')).not.toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('renders multiple children when entitled', () => {
      mockHasEntitlement.mockReturnValue(true);

      renderWithRouter(
        <EntitlementGate feature="all_content">
          <div data-testid="child-1">First</div>
          <div data-testid="child-2">Second</div>
        </EntitlementGate>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });

    it('renders text children when entitled', () => {
      mockHasEntitlement.mockReturnValue(true);

      renderWithRouter(
        <EntitlementGate feature="all_content">
          Just text
        </EntitlementGate>
      );

      expect(screen.getByText('Just text')).toBeInTheDocument();
    });
  });
});
