import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from './RegisterPage';
import { AuthContext } from '../context/AuthContext';

function renderWithAuth(register) {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={{ register }}>
        <RegisterPage />
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

describe('RegisterPage', () => {
  it('renders the registration form fields and submit button', () => {
    renderWithAuth(vi.fn());
    expect(screen.getByText('Create Account')).not.toBeNull();
    expect(screen.getByPlaceholderText('John Doe')).not.toBeNull();
    expect(screen.getByPlaceholderText('you@example.com')).not.toBeNull();
    expect(screen.getByPlaceholderText('Min. 6 characters')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Register' })).not.toBeNull();
  });

  it('updates input values as the user types', () => {
    renderWithAuth(vi.fn());
    const nameInput = screen.getByPlaceholderText('John Doe');
    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
    expect(nameInput.value).toBe('Jane Doe');
  });

  it('calls register with the form data and navigates on success', async () => {
    const register = vi.fn().mockResolvedValue();
    renderWithAuth(register);

    fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Min. 6 characters'), { target: { value: 'secret123' } });

    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith('Jane Doe', 'jane@example.com', 'secret123');
    });
  });

  it('shows an error message when registration fails', async () => {
    const register = vi.fn().mockRejectedValue(new Error('fail'));
    renderWithAuth(register);

    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    expect(await screen.findByText('Registration failed. Please try again.')).not.toBeNull();
  });

  it('links back to the login page', () => {
    renderWithAuth(vi.fn());
    const link = screen.getByRole('link', { name: 'Login' });
    expect(link.getAttribute('href')).toBe('/login');
  });
});
