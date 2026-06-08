import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

function SummaryCard({ title, amount, color, icon, loading }) {
  return (
    <div className={`bg-white rounded-2xl shadow p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-gray-100 rounded animate-pulse mt-1" />
          ) : (
            <p className="text-2xl font-bold text-gray-800 mt-1">
              ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          )}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

function RecentTransactionRow({ t }) {
  const isIncome = t.type === 'income';
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <span className={`text-xl ${isIncome ? 'text-green-500' : 'text-red-400'}`}>
          {isIncome ? '💰' : '💸'}
        </span>
        <div>
          <p className="font-medium text-gray-800 text-sm">{t.category}</p>
          <p className="text-xs text-gray-400">
            {t.description || '—'} · {new Date(t.date).toLocaleDateString()}
          </p>
        </div>
      </div>
      <span className={`font-semibold text-sm ${isIncome ? 'text-green-600' : 'text-red-500'}`}>
        {isIncome ? '+' : '-'}${t.amount.toLocaleString()}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, balance: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [summaryRes, txRes] = await Promise.all([
          API.get('/transactions/summary'),
          API.get('/transactions?limit=5'),
        ]);
        setSummary(summaryRes.data);
        setRecent(txRes.data.slice(0, 5));
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">Dashboard</h1>
        <p className="text-gray-500 mb-8">Welcome back, {user?.name || 'User'}!</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <SummaryCard title="Total Income"   amount={summary.totalIncome}   color="border-green-500" icon="💰" loading={loading} />
          <SummaryCard title="Total Expenses" amount={summary.totalExpenses} color="border-red-500"   icon="💸" loading={loading} />
          <SummaryCard title="Balance"        amount={summary.balance}       color="border-blue-500"  icon="📊" loading={loading} />
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Recent Transactions</h2>
            <a href="/transactions" className="text-sm text-green-600 hover:underline font-medium">
              View all →
            </a>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="flex items-center justify-center h-24 bg-gray-50 rounded-xl text-gray-400 text-sm">
              No transactions yet. <a href="/transactions" className="ml-1 text-green-500 hover:underline">Add your first one!</a>
            </div>
          ) : (
            <div>
              {recent.map(t => <RecentTransactionRow key={t._id} t={t} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
