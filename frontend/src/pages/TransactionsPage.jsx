import { useState, useEffect } from 'react';
import API from '../services/api';

const CATEGORIES = [
    'Salary', 'Freelance', 'Investment', 'Gift',
    'Food', 'Housing', 'Transport', 'Healthcare',
    'Entertainment', 'Shopping', 'Utilities', 'Other',
  ];

function TransactionRow({ transaction, onDelete }) {
    const isIncome = transaction.type === 'income';
    return (
          <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                        <span className={`text-xl ${isIncome ? 'text-green-500' : 'text-red-400'}`}>
                          {isIncome ? '💰' : '💸'}
                        </span>span>
                        <div>
                                  <p className="font-medium text-gray-800 text-sm">{transaction.category}</p>p>
                                  <p className="text-xs text-gray-400">
                                    {transaction.description || '—'} &middot;{' '}
                                    {new Date(transaction.date).toLocaleDateString()}
                                  </p>p>
                        </div>div>
                </div>div>
                <div className="flex items-center gap-4">
                        <span className={`font-semibold ${isIncome ? 'text-green-600' : 'text-red-500'}`}>
                          {isIncome ? '+' : '-'}${transaction.amount.toLocaleString()}
                        </span>span>
                        <button
                                    onClick={() => onDelete(transaction._id)}
                                    className="text-gray-300 hover:text-red-400 transition-colors text-sm"
                                    title="Delete"
                                  >
                                  ✕
  </button>button>
                </div>div>
          </div>div>
        );
}

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
          type: 'expense',
          category: 'Food',
          amount: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
    });
  
    const fetchTransactions = async () => {
          try {
                  setLoading(true);
                  const res = await API.get('/transactions');
                  setTransactions(res.data);
          } catch (err) {
                  setError('Failed to load transactions.');
          } finally {
                  setLoading(false);
          }
    };
  
    useEffect(() => {
          fetchTransactions();
    }, []);
  
    const handleChange = (e) => {
          setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };
  
    const handleSubmit = async (e) => {
          e.preventDefault();
          if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
                  setError('Please enter a valid amount.');
                  return;
          }
          try {
                  setSubmitting(true);
                  setError('');
                  await API.post('/transactions', { ...form, amount: Number(form.amount) });
                  setForm({
                            type: 'expense',
                            category: 'Food',
                            amount: '',
                            description: '',
                            date: new Date().toISOString().split('T')[0],
                  });
                  setShowForm(false);
                  await fetchTransactions();
          } catch (err) {
                  setError(err.response?.data?.message || 'Failed to add transaction.');
          } finally {
                  setSubmitting(false);
          }
    };
  
    const handleDelete = async (id) => {
          if (!window.confirm('Delete this transaction?')) return;
          try {
                  await API.delete(`/transactions/${id}`);
                  setTransactions((prev) => prev.filter((t) => t._id !== id));
          } catch (err) {
                  setError('Failed to delete transaction.');
          }
    };
  
    return (
          <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-3xl mx-auto">
                  {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                                  <div>
                                              <h1 className="text-3xl font-bold text-gray-800">Transactions</h1>h1>
                                              <p className="text-gray-500 text-sm mt-1">Track your income and expenses</p>p>
                                  </div>div>
                                  <button
                                                onClick={() => { setShowForm((v) => !v); setError(''); }}
                                                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-xl transition-colors"
                                              >
                                    {showForm ? 'Cancel' : '+ Add Transaction'}
                                  </button>button>
                        </div>div>
                
                  {/* Error */}
                  {error && (
                      <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-4 text-sm">
                        {error}
                      </div>div>
                        )}
                
                  {/* Add Transaction Form */}
                  {showForm && (
                      <div className="bg-white rounded-2xl shadow p-6 mb-6">
                                  <h2 className="text-lg font-semibold text-gray-700 mb-4">New Transaction</h2>h2>
                                  <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Type */}
                                                <div>
                                                                <label className="block text-sm font-medium text-gray-600 mb-1">Type</label>label>
                                                                <select
                                                                                    name="type"
                                                                                    value={form.type}
                                                                                    onChange={handleChange}
                                                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                                                                                  >
                                                                                  <option value="income">Income</option>option>
                                                                                  <option value="expense">Expense</option>option>
                                                                </select>select>
                                                </div>div>
                                    {/* Category */}
                                                <div>
                                                                <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>label>
                                                                <select
                                                                                    name="category"
                                                                                    value={form.category}
                                                                                    onChange={handleChange}
                                                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                                                                                  >
                                                                  {CATEGORIES.map((c) => (
                                                                                                        <option key={c} value={c}>{c}</option>option>
                                                                                                      ))}
                                                                </select>select>
                                                </div>div>
                                    {/* Amount */}
                                                <div>
                                                                <label className="block text-sm font-medium text-gray-600 mb-1">Amount ($)</label>label>
                                                                <input
                                                                                    type="number"
                                                                                    name="amount"
                                                                                    value={form.amount}
                                                                                    onChange={handleChange}
                                                                                    placeholder="0.00"
                                                                                    min="0"
                                                                                    step="0.01"
                                                                                    required
                                                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                                                                                  />
                                                </div>div>
                                    {/* Date */}
                                                <div>
                                                                <label className="block text-sm font-medium text-gray-600 mb-1">Date</label>label>
                                                                <input
                                                                                    type="date"
                                                                                    name="date"
                                                                                    value={form.date}
                                                                                    onChange={handleChange}
                                                                                    required
                                                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                                                                                  />
                                                </div>div>
                                    {/* Description */}
                                                <div className="sm:col-span-2">
                                                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                                                                  Description <span className="text-gray-400">(optional)</span>span>
                                                                </label>label>
                                                                <input
                                                                                    type="text"
                                                                                    name="description"
                                                                                    value={form.description}
                                                                                    onChange={handleChange}
                                                                                    placeholder="e.g. Monthly rent"
                                                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                                                                                  />
                                                </div>div>
                                    {/* Submit */}
                                                <div className="sm:col-span-2 flex justify-end">
                                                                <button
                                                                                    type="submit"
                                                                                    disabled={submitting}
                                                                                    className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-xl transition-colors"
                                                                                  >
                                                                  {submitting ? 'Saving...' : 'Save Transaction'}
                                                                </button>button>
                                                </div>div>
                                  </form>form>
                      </div>div>
                        )}
                
                  {/* Transactions List */}
                        <div className="bg-white rounded-2xl shadow p-6">
                                  <h2 className="text-lg font-semibold text-gray-700 mb-4">
                                              All Transactions
                                    {transactions.length > 0 && (
                          <span className="ml-2 text-sm font-normal text-gray-400">
                                          ({transactions.length})
                          </span>span>
                                              )}
                                  </h2>h2>
                        
                          {loading ? (
                        <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
                                      Loading...
                        </div>div>
                      ) : transactions.length === 0 ? (
                        <div className="flex items-center justify-center h-24 bg-gray-50 rounded-xl text-gray-400 text-sm">
                                      No transactions yet. Add your first one!
                        </div>div>
                      ) : (
                        <div>
                          {transactions.map((t) => (
                                          <TransactionRow key={t._id} transaction={t} onDelete={handleDelete} />
                                        ))}
                        </div>div>
                                  )}
                        </div>div>
                </div>div>
          </div>div>
        );
}</div>
