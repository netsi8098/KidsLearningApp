import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ReactElement } from 'react';

// Create a custom render that wraps with providers
function renderWithProviders(
  ui: ReactElement,
  options?: RenderOptions & { route?: string }
) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={[options?.route ?? '/']}>
      {children}
    </MemoryRouter>
  );
  return render(ui, { wrapper: Wrapper, ...options });
}

export { renderWithProviders };
