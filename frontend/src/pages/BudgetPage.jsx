import { useState, useEffect } from 'react';
import api from '../services/api';

const CATEGORIES = ['Food', 'Transport', 'Housing', 'Entertainment', 'Healthcare', 'Shopping', 'Education', 'Other'];

const BudgetPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [form, setForm] = useState({ category: 'Food', limit: '', month: '' });

  const currentMonth = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/budgets');
      setBudgets(res.data);
    } catch (err) {
      setError('Failed to load budgets.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBudget) {
        await api.put(`/budgets/${editingBudget._id}`, form);
      } else {
        await api.post('/budgets', form);
      }
      setForm({ category: 'Food', limit: '', month: '' });
      setEditingBudget(null);
      setShowForm(false);
      fetchBudgets();
    } catch (err) {
      setError('Failed to save budget.');
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setForm({ category: budget.category, limit: budget.limit, month: budget.month });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    try {
      await api.delete(`/budgets/${id}`);
      fetchBudgets();
    } catch (err) {
      setError('Failed to delete budget.');
    }
  };

  const getSpentPercent = (budget) => {
    if (!budget.spent || budget.limit === 0) return 0;
    return Math.min(100, Math.round((budget.spent / budget.limit) * 100));
  };

  const getBarColor = (percent) => {
    if (percent >= 100) return 'bg-red-500';
    if (percent >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Budget Manager</h1>
        <button
          onClick={() => { setShowForm(!showForm); setEditingBudget(null); setForm({ category: 'Food', limit: '', month: currentMonth }); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add Budget
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {showForm && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{editingBudget ? 'Edit Budget' : 'New Budget'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Limit ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={form.limit}
                onChange={(e) => setForm({ ...form, limit: e.target.value })}
                placeholder="e.g. 500"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <input
                type="month"
                required
                value={form.month}
                onChange={(e) => setForm({ ...form, month: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div className="md:col-span-3 flex gap-3">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                {editingBudget ? 'Update' : 'Save'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingBudget(null); }} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading budgets...</p>
      ) : budgets.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">No budgets set yet.</p>
          <p className="text-sm mt-1">Click Add Budget to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((budget) => {
            const percent = getSpentPercent(budget);
            return (
              <div key={budget._id} className="bg-white rounded-xl shadow p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{budget.category}</h3>
                    <p className="text-sm text-gray-500">{budget.month}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(budget)} className="text-blue-500 hover:text-blue-700 text-sm">Edit</button>
                    <button onClick={() => handleDelete(budget._id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Spent: ${budget.spent?.toFixed(2) || '0.00'}</span>
                    <span>Limit: ${parseFloat(budget.limit).toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getBarColor(percent)}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-right">{percent}% used</p>
                </div>
                {percent >= 100 && (
                  <p className="text-xs text-red-500 font-medium">Budget exceeded!</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BudgetPage;
