import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFoundPage from './NotFoundPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <NotFoundPage />
    </MemoryRouter>
  );
}

describe('NotFoundPage', () => {
  it('renders a 404 heading', () => {
    renderPage();
    expect(screen.getByText('404')).not.toBeNull();
  });

  it('renders a "Page Not Found" title', () => {
    renderPage();
    expect(screen.getByText('Page Not Found')).not.toBeNull();
  });

  it('shows an explanatory message to the user', () => {
    renderPage();
    expect(screen.getByText(/doesn't exist or has been moved/i)).not.toBeNull();
  });

  it('renders a link back to the dashboard pointing at "/"', () => {
    renderPage();
    const link = screen.getByRole('link', { name: 'Back to Dashboard' });
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toBe('/');
  });
});
