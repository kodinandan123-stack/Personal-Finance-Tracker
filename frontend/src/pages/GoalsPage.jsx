import { useState, useEffect } from 'react';
import API from '../services/api';

function GoalCard({ goal, onDelete }) {
  const percent = Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100));
  const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);
  const isComplete = percent >= 100;

  return (
    <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-800 text-base">{goal.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {goal.deadline ? `Deadline: ${new Date(goal.deadline).toLocaleDateString()}` : 'No deadline'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isComplete && <span className="text-green-500 text-xl" title="Goal reached!">🏆</span>}
          <button
            onClick={() => onDelete(goal._id)}
            className="text-gray-300 hover:text-red-400 transition-colors text-sm"
            title="Delete goal"
          >✕</button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all ${isComplete ? 'bg-green-500' : 'bg-blue-500'}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">
          Saved: <span className="font-medium text-gray-700">${goal.savedAmount.toLocaleString()}</span>
        </span>
        <span className="text-gray-500">
          Target: <span className="font-medium text-gray-700">${goal.targetAmount.toLocaleString()}</span>
        </span>
        <span className={`font-semibold ${isComplete ? 'text-green-600' : 'text-blue-600'}`}>
          {isComplete ? 'Complete!' : `${percent}%`}
        </span>
      </div>

      {!isComplete && (
        <p className="text-xs text-gray-400">${remaining.toLocaleString()} remaining to reach your goal</p>
      )}
    </div>
  );
}

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    targetAmount: '',
    savedAmount: '',
    deadline: '',
  });

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await API.get('/goals');
      setGoals(res.data);
    } catch (err) {
      setError('Failed to load goals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.targetAmount || Number(form.targetAmount) <= 0) {
      setError('Please enter a valid goal name and target amount.');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      await API.post('/goals', {
        name: form.name.trim(),
        targetAmount: Number(form.targetAmount),
        savedAmount: Number(form.savedAmount) || 0,
        deadline: form.deadline || undefined,
      });
      setForm({ name: '', targetAmount: '', savedAmount: '', deadline: '' });
      setShowForm(false);
      await fetchGoals();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create goal.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      await API.delete(`/goals/${id}`);
      setGoals(prev => prev.filter(g => g._id !== id));
    } catch (err) {
      setError('Failed to delete goal.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Savings Goals</h1>
            <p className="text-gray-500 text-sm mt-1">Track your progress towards financial targets</p>
          </div>
          <button
            onClick={() => { setShowForm(v => !v); setError(''); }}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            {showForm ? 'Cancel' : '+ New Goal'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-4 text-sm">{error}</div>
        )}

        {/* New Goal Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">New Savings Goal</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Goal Name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange}
                  placeholder="e.g. Emergency Fund, New Laptop"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Target Amount ($)</label>
                <input type="number" name="targetAmount" value={form.targetAmount} onChange={handleChange}
                  placeholder="5000" min="1" step="0.01"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Already Saved ($)</label>
                <input type="number" name="savedAmount" value={form.savedAmount} onChange={handleChange}
                  placeholder="0" min="0" step="0.01"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Deadline <span className="text-gray-400">(optional)</span>
                </label>
                <input type="date" name="deadline" value={form.deadline} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <button type="submit" disabled={submitting}
                  className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-xl transition-colors">
                  {submitting ? 'Saving...' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Goals List */}
        {loading ? (
          <div className="space-y-4">
            {[1,2].map(i => <div key={i} className="h-32 bg-white rounded-2xl shadow animate-pulse" />)}
          </div>
        ) : goals.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-12 flex flex-col items-center gap-3 text-gray-400">
            <span className="text-5xl">🎯</span>
            <p className="font-medium text-gray-500">No savings goals yet</p>
            <p className="text-sm">Create your first goal to start tracking your progress!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {goals.map(g => <GoalCard key={g._id} goal={g} onDelete={handleDelete} />)}
          </div>
        )}
      </div>
    </div>
  );
}
