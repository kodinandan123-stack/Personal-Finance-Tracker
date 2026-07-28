import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';
import { AuthContext } from '../context/AuthContext';

function renderNavbar({ user = null, logout = vi.fn() } = {}) {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={{ user, logout }}>
        <Navbar />
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: false });
});

describe('Navbar', () => {
  it('renders the brand link to the dashboard', () => {
    renderNavbar();
    expect(screen.getByText('FinanceTracker')).not.toBeNull();
  });

  it('renders all navigation links', () => {
    renderNavbar();
    ['Dashboard', 'Transactions', 'Budget', 'Goals', 'Recurring', 'Reports', 'Analytics'].forEach((label) => {
      expect(screen.getByText(label)).not.toBeNull();
    });
  });

  it("shows the user's name and initial when a user is logged in", () => {
    renderNavbar({ user: { name: 'Jane Doe' } });
    expect(screen.getByText('Jane Doe')).not.toBeNull();
    expect(screen.getByText('J')).not.toBeNull();
  });

  it('falls back to a default profile label and initial when there is no user', () => {
    renderNavbar({ user: null });
    expect(screen.getByText('Profile')).not.toBeNull();
    expect(screen.getByText('U')).not.toBeNull();
  });

  it('calls logout when the Logout button is clicked', () => {
    const logout = vi.fn();
    renderNavbar({ logout });
    fireEvent.click(screen.getByRole('button', { name: 'Logout' }));
    expect(logout).toHaveBeenCalled();
  });

  it('toggles the mobile menu open and closed when the menu button is clicked', () => {
    renderNavbar();
    expect(screen.getAllByText('Dashboard')).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: 'Toggle menu' }));
    expect(screen.getAllByText('Dashboard')).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: 'Toggle menu' }));
    expect(screen.getAllByText('Dashboard')).toHaveLength(1);
  });
});
