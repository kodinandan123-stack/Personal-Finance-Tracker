import { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const NAV_LINKS = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/transactions', label: 'Transactions', icon: '💸' },
    { to: '/budget', label: 'Budget', icon: '🎯' },
    { to: '/goals', label: 'Goals', icon: '⭐' },
    { to: '/recurring', label: 'Recurring', icon: '🔄' },
    { to: '/reports', label: 'Reports', icon: '📈' },
    ];

export default function Navbar() {
      const { user, logout } = useContext(AuthContext);
      const navigate = useNavigate();
      const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
          logout();
          navigate('/login');
  };

  return (
          <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            {/* Logo */}
                                  <NavLink to="/dashboard" className="flex items-center gap-2">
                                              <span className="text-2xl">💰</span>span>
                                              <span className="text-lg font-bold text-green-600 hidden sm:block">FinanceTracker</span>span>
                                  </NavLink>NavLink>
                        
                            {/* Desktop Nav Links */}
                                  <div className="hidden md:flex items-center gap-1">
                                      {NAV_LINKS.map((link) => (
                            <NavLink
                                                key={link.to}
                                                to={link.to}
                                                className={({ isActive }) =>
                                                                      `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                                                              isActive
                                                                                                ? 'bg-green-50 text-green-700'
                                                                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                                      }`
                                                }
                                              >
                                            <span>{link.icon}</span>span>
                                            <span>{link.label}</span>span>
                            </NavLink>NavLink>
                          ))}
                                  </div>div>
                        
                            {/* Right side - Profile & Logout */}
                                  <div className="flex items-center gap-3">
                                              <NavLink
                                                                to="/profile"
                                                                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                                              >
                                                            <span className="w-7 h-7 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-semibold text-xs">
                                                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                                            </span>span>
                                                            <span className="hidden lg:block">{user?.name || 'Profile'}</span>span>
                                              </NavLink>NavLink>
                                              <button
                                                                onClick={handleLogout}
                                                                className="text-sm text-gray-500 hover:text-red-500 font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                                                              >
                                                            Logout
                                              </button>button>
                                      {/* Mobile menu button */}
                                              <button
                                                                onClick={() => setMenuOpen(!menuOpen)}
                                                                className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                                                                aria-label="Toggle menu"
                                                              >
                                                  {menuOpen ? '✕' : '☰'}
                                              </button>button>
                                  </div>div>
                        </div>div>
                
                    {/* Mobile Menu */}
                    {menuOpen && (
                        <div className="md:hidden pb-4 pt-2 space-y-1 border-t border-gray-100 mt-1">
                            {NAV_LINKS.map((link) => (
                                          <NavLink
                                                              key={link.to}
                                                              to={link.to}
                                                              onClick={() => setMenuOpen(false)}
                                                              className={({ isActive }) =>
                                                                                    `flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                                                                                            isActive
                                                                                                              ? 'bg-green-50 text-green-700'
                                                                                                              : 'text-gray-600 hover:bg-gray-50'
                                                                                        }`
                                                              }
                                                            >
                                                          <span>{link.icon}</span>span>
                                                          <span>{link.label}</span>span>
                                          </NavLink>NavLink>
                                        ))}
                                    <NavLink
                                                      to="/profile"
                                                      onClick={() => setMenuOpen(false)}
                                                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                                                    >
                                                  <span>👤</span>span>
                                                  <span>Profile</span>span>
                                    </NavLink>NavLink>
                        </div>div>
                        )}
                </div>div>
          </nav>nav>
        );
}</nav>
