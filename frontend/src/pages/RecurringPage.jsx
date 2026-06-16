import { useState, useEffect } from 'react';
import API from '../services/api';
import NotificationBanner from '../components/NotificationBanner';

const FREQUENCIES = ['daily', 'weekly', 'monthly', 'yearly'];
const CATEGORIES = [
    'Salary', 'Freelance', 'Investment', 'Gift',
    'Food', 'Housing', 'Transport', 'Healthcare',
    'Entertainment', 'Shopping', 'Utilities', 'Other',
  ];

function RecurringRow({ item, onDelete, onProcess }) {
    const isIncome = item.type === 'income';
    return (
          <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
            <div className="flex items-center gap-3">
              <span className={`text-xl ${isIncome ? 'text-green-500' : 'text-red-400'}`}>
                {isIncome ? '🔄💰' : '🔄💸'}
              </span>
              <div>
                <p className="font-medium text-gray-800 text-sm">{item.category}</p>
                <p className="text-xs text-gray-400">
                  {item.description || '—'} &middot; {item.frequency} &middot; Next:{' '}
                  {item.nextDue ? new Date(item.nextDue).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`font-semibold text-sm ${isIncome ? 'text-green-600' : 'text-red-500'}`}>
                {isIncome ? '+' : '-'}${item.amount.toLocaleString()}
              </span>
              <button
                onClick={() => onProcess(item._id)}
                className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors"
                title="Process now"
              >
                Run
              </button>
              <button
                onClick={() => onDelete(item._id)}
                className="text-gray-300 hover:text-red-400 transition-colors text-sm"
                title="Delete"
              >
                ✕
              </button>
            </div>
          </div>
        );
  }

export default function RecurringPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ message: '', variant: 'info' });
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
          type: 'expense',
          category: 'Food',
          amount: '',
          description: '',
          frequency: 'monthly',
          startDate: new Date().toISOString().split('T')[0],
        });

    const fetchItems = async () => {
          try {
                  setLoading(true);
                  const res = await API.get('/recurring');
                  setItems(res.data);
                } catch {
                  setNotification({ message: 'Failed to load recurring transactions.', variant: 'error' });
                } finally {
                  setLoading(false);
                }
        };

    useEffect(() => {
          fetchItems();
        }, []);

    const handleChange = (e) => {
          setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        };

    const handleSubmit = async (e) => {
          e.preventDefault();
          if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
                  setNotification({ message: 'Please enter a valid amount.', variant: 'warning' });
                  return;
                }
          try {
                  setSubmitting(true);
                  await API.post('/recurring', { ...form, amount: Number(form.amount) });
                  setForm({
                            type: 'expense',
                            category: 'Food',
                            amount: '',
                            description: '',
                            frequency: 'monthly',
                            startDate: new Date().toISOString().split('T')[0],
                          });
                  setShowForm(false);
                  setNotification({ message: 'Recurring transaction added!', variant: 'success' });
                  await fetchItems();
                } catch (err) {
                  setNotification({
                            message: err.response?.data?.message || 'Failed to add recurring transaction.',
                            variant: 'error',
                          });
                } finally {
                  setSubmitting(false);
                }
        };

    const handleDelete = async (id) => {
          if (!window.confirm('Delete this recurring transaction?')) return;
          try {
                  await API.delete(`/recurring/${id}`);
                  setItems((prev) => prev.filter((i) => i._id !== id));
                  setNotification({ message: 'Recurring transaction deleted.', variant: 'success' });
                } catch {
                  setNotification({ message: 'Failed to delete.', variant: 'error' });
                }
        };

    const handleProcess = async (id) => {
          try {
                  await API.post(`/recurring/${id}/process`);
                  setNotification({ message: 'Transaction processed successfully!', variant: 'success' });
                  await fetchItems();
                } catch {
                  setNotification({ message: 'Failed to process transaction.', variant: 'error' });
                }
        };

    return (
          <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Recurring Transactions</h1>
                  <p className="text-gray-500 text-sm mt-1">Automate your regular income and expenses</p>
                </div>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors shadow"
                >
                  {showForm ? 'Cancel' : '+ New Recurring'}
                </button>
              </div>

              {notification.message && (
                          <div className="mb-4">
                            <NotificationBanner
                              message={notification.message}
                              variant={notification.variant}
                              autoDismiss={4000}
                              onDismiss={() => setNotification({ message: '', variant: 'info' })}
                            />
                          </div>
                        )}

              {showForm && (
                          <div className="bg-white rounded-2xl shadow p-6 mb-6">
                            <h2 className="text-lg font-semibold text-gray-700 mb-4">New Recurring Transaction</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-600 mb-1">Type</label>
                                  <select
                                    name="type"
                                    value={form.type}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                                  >
                                    <option value="expense">Expense</option>
                                    <option value="income">Income</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-600 mb-1">Frequency</label>
                                  <select
                                    name="frequency"
                                    value={form.frequency}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                                  >
                                    {FREQUENCIES.map((f) => (
                                                            <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
                                                          ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
                                  <select
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                                  >
                                    {CATEGORIES.map((c) => (
                                                            <option key={c} value={c}>{c}</option>
                                                          ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-600 mb-1">Amount ($)</label>
                                  <input
                                    type="number"
                                    name="amount"
                                    value={form.amount}
                                    onChange={handleChange}
                                    min="0.01"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
                                  <input
                                    type="date"
                                    name="startDate"
                                    value={form.startDate}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                                  <input
                                    type="text"
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Optional note"
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                                  />
                                </div>
                              </div>
                              <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-2.5 rounded-xl transition-colors"
                              >
                                {submitting ? 'Saving...' : 'Save Recurring Transaction'}
                              </button>
                            </form>
                          </div>
                        )}

              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Active Recurring Transactions</h2>
                {loading ? (
                              <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                                  <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
                                                ))}
                              </div>
                            ) : items.length === 0 ? (
                              <div className="flex items-center justify-center h-24 bg-gray-50 rounded-xl text-gray-400 text-sm">
                                No recurring transactions yet. Add one above!
                              </div>
                            ) : (
                              <div>
                                {items.map((item) => (
                                                  <RecurringRow
                                                    key={item._id}
                                                    item={item}
                                                    onDelete={handleDelete}
                                                    onProcess={handleProcess}
                                                  />
                                                ))}
                              </div>
                            )}
              </div>
            </div>
          </div>
        );
  }
