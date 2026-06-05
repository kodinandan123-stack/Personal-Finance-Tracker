import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function RegisterPage() {
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
                await register(form.name, form.email, form.password);
                navigate('/dashboard');
        } catch (err) {
                setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
                setLoading(false);
        }
  };

  return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
                      <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">Create Account</h2>h2>
                      <p className="text-gray-500 text-center mb-6">Start tracking your finances today</p>p>
              
                {error && (
                    <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 mb-4 text-sm">
                      {error}
                    </div>div>
                      )}
              
                      <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>label>
                                            <input
                                                            type="text"
                                                            name="name"
                                                            value={form.name}
                                                            onChange={handleChange}
                                                            required
                                                            placeholder="John Doe"
                                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                          />
                                </div>div>
                      
                                <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>label>
                                            <input
                                                            type="email"
                                                            name="email"
                                                            value={form.email}
                                                            onChange={handleChange}
                                                            required
                                                            placeholder="you@example.com"
                                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                          />
                                </div>div>
                      
                                <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>label>
                                            <input
                                                            type="password"
                                                            name="password"
                                                            value={form.password}
                                                            onChange={handleChange}
                                                            required
                                                            placeholder="Min. 6 characters"
                                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                          />
                                </div>div>
                      
                                <button
                                              type="submit"
                                              disabled={loading}
                                              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
                                            >
                                  {loading ? 'Creating account...' : 'Register'}
                                </button>button>
                      </form>form>
              
                      <p className="text-center text-sm text-gray-500 mt-6">
                                Already have an account?{' '}
                                <Link to="/login" className="text-blue-600 hover:underline font-medium">
                                            Login
                                </Link>Link>
                      </p>p>
              </div>div>
        </div>div>
      );
}</div>
