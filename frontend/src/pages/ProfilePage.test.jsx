import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfilePage from './ProfilePage';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

vi.mock('../services/api', () => ({
  default: { put: vi.fn() },
}));

const mockUser = { name: 'Jane Doe', email: 'jane@example.com' };

function renderWithAuth(user, setUser = vi.fn()) {
    return render(
          <AuthContext.Provider value={{ user, setUser }}>
                  <ProfilePage />
          </AuthContext.Provider>
        );
}

describe('ProfilePage', () => {
    beforeEach(() => {
          API.put.mockReset();
    });

           it('renders profile info and pre-fills the form with the current user', () => {
                 renderWithAuth(mockUser);
                 expect(screen.getByText('Profile')).not.toBeNull();
                 expect(screen.getByDisplayValue('Jane Doe')).not.toBeNull();
                 expect(screen.getByDisplayValue('jane@example.com')).not.toBeNull();
           });

           it('updates profile form fields as the user types', () => {
                 renderWithAuth(mockUser);
                 const nameInput = screen.getByDisplayValue('Jane Doe');
                 fireEvent.change(nameInput, { target: { value: 'Janet Doe' } });
                 expect(nameInput.value).toBe('Janet Doe');
           });

           it('submits profile updates and shows a success message', async () => {
                 const setUser = vi.fn();
                 API.put.mockResolvedValue({ data: { user: { ...mockUser, name: 'Janet Doe' } } });
                 renderWithAuth(mockUser, setUser);

                  fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

                  await waitFor(() => {
                          expect(API.put).toHaveBeenCalledWith('/auth/profile', { name: 'Jane Doe', email: 'jane@example.com' });
                  });
                 expect(await screen.findByText('Profile updated successfully.')).not.toBeNull();
                 expect(setUser).toHaveBeenCalled();
           });

           it('shows an error message when the profile update fails', async () => {
                 API.put.mockRejectedValue({ response: { data: { message: 'Email already in use' } } });
                 renderWithAuth(mockUser);

                  fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

                  expect(await screen.findByText('Email already in use')).not.toBeNull();
           });

           it('shows a validation error when new passwords do not match', async () => {
                 renderWithAuth(mockUser);

                  fireEvent.change(screen.getByPlaceholderText('Enter current password'), { target: { value: 'oldpass123' } });
                 fireEvent.change(screen.getByPlaceholderText('Min. 8 characters'), { target: { value: 'newpassword1' } });
                 fireEvent.change(screen.getByPlaceholderText('Repeat new password'), { target: { value: 'different1' } });
                 fireEvent.click(screen.getByRole('button', { name: 'Update Password' }));

                  expect(await screen.findByText('New passwords do not match.')).not.toBeNull();
                 expect(API.put).not.toHaveBeenCalled();
           });

           it('shows a validation error when the new password is too short', async () => {
                 renderWithAuth(mockUser);

                  fireEvent.change(screen.getByPlaceholderText('Enter current password'), { target: { value: 'oldpass123' } });
                 fireEvent.change(screen.getByPlaceholderText('Min. 8 characters'), { target: { value: 'short' } });
                 fireEvent.change(screen.getByPlaceholderText('Repeat new password'), { target: { value: 'short' } });
                 fireEvent.click(screen.getByRole('button', { name: 'Update Password' }));

                  expect(await screen.findByText('New password must be at least 8 characters.')).not.toBeNull();
           });

           it('submits a password change successfully', async () => {
                 API.put.mockResolvedValue({});
                 renderWithAuth(mockUser);

                  fireEvent.change(screen.getByPlaceholderText('Enter current password'), { target: { value: 'oldpass123' } });
                 fireEvent.change(screen.getByPlaceholderText('Min. 8 characters'), { target: { value: 'newpassword1' } });
                 fireEvent.change(screen.getByPlaceholderText('Repeat new password'), { target: { value: 'newpassword1' } });
                 fireEvent.click(screen.getByRole('button', { name: 'Update Password' }));

                  await waitFor(() => {
                          expect(API.put).toHaveBeenCalledWith('/auth/change-password', {
                                    currentPassword: 'oldpass123',
                                    newPassword: 'newpassword1',
                          });
                  });
                 expect(await screen.findByText('Password changed successfully.')).not.toBeNull();
           });
});
