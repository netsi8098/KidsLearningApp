import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DeepLinkResolver from '../../../src/components/DeepLinkResolver';

const mockResolveDeepLink = vi.fn();

vi.mock('../../../src/hooks/useDeepLink', () => ({
  useDeepLink: () => ({
    resolveDeepLink: mockResolveDeepLink,
    generateShareLink: vi.fn(),
  }),
}));

describe('DeepLinkResolver', () => {
  beforeEach(() => {
    mockResolveDeepLink.mockClear();
  });

  it('renders children', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <DeepLinkResolver>
          <div data-testid="app-content">App Content</div>
        </DeepLinkResolver>
      </MemoryRouter>
    );

    expect(screen.getByTestId('app-content')).toBeInTheDocument();
  });

  it('resolves deep link when dl param is present', () => {
    render(
      <MemoryRouter initialEntries={['/?dl=kidlearn://abc']}>
        <DeepLinkResolver>
          <div>App</div>
        </DeepLinkResolver>
      </MemoryRouter>
    );

    expect(mockResolveDeepLink).toHaveBeenCalledWith('kidlearn://abc');
  });

  it('resolves deep link when deeplink param is present', () => {
    render(
      <MemoryRouter initialEntries={['/?deeplink=kidlearn://numbers']}>
        <DeepLinkResolver>
          <div>App</div>
        </DeepLinkResolver>
      </MemoryRouter>
    );

    expect(mockResolveDeepLink).toHaveBeenCalledWith('kidlearn://numbers');
  });

  it('prefers dl param over deeplink param when both present', () => {
    render(
      <MemoryRouter initialEntries={['/?dl=kidlearn://abc&deeplink=kidlearn://numbers']}>
        <DeepLinkResolver>
          <div>App</div>
        </DeepLinkResolver>
      </MemoryRouter>
    );

    // The code uses: params.get('dl') || params.get('deeplink')
    // So dl takes precedence
    expect(mockResolveDeepLink).toHaveBeenCalledWith('kidlearn://abc');
  });

  it('does not call resolveDeepLink when no deeplink params', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <DeepLinkResolver>
          <div>App</div>
        </DeepLinkResolver>
      </MemoryRouter>
    );

    expect(mockResolveDeepLink).not.toHaveBeenCalled();
  });

  it('does not call resolveDeepLink with unrelated params', () => {
    render(
      <MemoryRouter initialEntries={['/?page=abc&ref=home']}>
        <DeepLinkResolver>
          <div>App</div>
        </DeepLinkResolver>
      </MemoryRouter>
    );

    expect(mockResolveDeepLink).not.toHaveBeenCalled();
  });

  it('handles dl param with bare page key', () => {
    render(
      <MemoryRouter initialEntries={['/?dl=settings']}>
        <DeepLinkResolver>
          <div>App</div>
        </DeepLinkResolver>
      </MemoryRouter>
    );

    expect(mockResolveDeepLink).toHaveBeenCalledWith('settings');
  });

  it('handles deep link with path parameter', () => {
    render(
      <MemoryRouter initialEntries={['/?dl=kidlearn://collections/nature']}>
        <DeepLinkResolver>
          <div>App</div>
        </DeepLinkResolver>
      </MemoryRouter>
    );

    expect(mockResolveDeepLink).toHaveBeenCalledWith('kidlearn://collections/nature');
  });

  it('renders children alongside resolving deep link', () => {
    render(
      <MemoryRouter initialEntries={['/?dl=kidlearn://abc']}>
        <DeepLinkResolver>
          <div data-testid="child-content">Child</div>
        </DeepLinkResolver>
      </MemoryRouter>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(mockResolveDeepLink).toHaveBeenCalled();
  });
});
