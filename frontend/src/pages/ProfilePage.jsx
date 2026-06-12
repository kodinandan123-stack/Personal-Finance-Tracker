import { useState, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import NotificationBanner from '../components/NotificationBanner';

/**
 * ProfilePage
 * Lets the authenticated user view and update their display name / email,
 * and change their password.
 */
export default function ProfilePage() {
  const { user, setUser } = useContext(AuthContext);

  // --- Profile form state ---
  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ text: '', variant: 'info' });

  // --- Password form state ---
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ text: '', variant: 'info' });

  // --- Handlers ---
  const handleProfileChange = (e) => {
    setProfileForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e) => {
    setPasswordForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg({ text: '', variant: 'info' });
    try {
      const res = await API.put('/auth/profile', {
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
      });
      setUser(res.data.user);
      setProfileMsg({ text: 'Profile updated successfully.', variant: 'success' });
    } catch (err) {
      setProfileMsg({
        text: err.response?.data?.message || 'Failed to update profile.',
        variant: 'error',
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg({ text: '', variant: 'info' });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match.', variant: 'error' });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordMsg({ text: 'New password must be at least 8 characters.', variant: 'error' });
      return;
    }

    setPasswordLoading(true);
    try {
      await API.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordMsg({ text: 'Password changed successfully.', variant: 'success' });
    } catch (err) {
      setPasswordMsg({
        text: err.response?.data?.message || 'Failed to change password.',
        variant: 'error',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const inputClass =
    'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400';
  const labelClass = 'block text-sm font-medium text-gray-600 mb-1';

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Profile</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your account information</p>
        </div>

        {/* Avatar / info card */}
        <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-2xl font-bold text-green-600 select-none">
            {(user?.name ?? user?.email ?? '?')[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-lg">{user?.name || '—'}</p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
          </div>
        </div>

        {/* Profile form */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Personal Information</h2>

          {profileMsg.text && (
            <div className="mb-4">
              <NotificationBanner
                message={profileMsg.text}
                variant={profileMsg.variant}
                autoDismiss={4000}
                onDismiss={() => setProfileMsg({ text: '', variant: 'info' })}
              />
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input
                type="text"
                name="name"
                value={profileForm.name}
                onChange={handleProfileChange}
                placeholder="Your name"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Email Address</label>
              <input
                type="email"
                name="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                placeholder="your@email.com"
                required
                className={inputClass}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={profileLoading}
                className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-xl transition-colors"
              >
                {profileLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Change password form */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Change Password</h2>

          {passwordMsg.text && (
            <div className="mb-4">
              <NotificationBanner
                message={passwordMsg.text}
                variant={passwordMsg.variant}
                autoDismiss={4000}
                onDismiss={() => setPasswordMsg({ text: '', variant: 'info' })}
              />
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                placeholder="Min. 8 characters"
                required
                minLength={8}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Repeat new password"
                required
                className={inputClass}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={passwordLoading}
                className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-xl transition-colors"
              >
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
