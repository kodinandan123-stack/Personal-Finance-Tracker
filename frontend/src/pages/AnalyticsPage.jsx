import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import api from '../services/api';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v || 0);

function SectionCard({ title, children, loading }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">{title}</h2>
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : children}
    </div>
  );
}

export default function AnalyticsPage() {
  const [spending, setSpending] = useState([]);
  const [incomeVsExpense, setIncomeVsExpense] = useState([]);
  const [netWorth, setNetWorth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [spendRes, iveRes, nwRes] = await Promise.all([
          api.get('/analytics/spending'),
          api.get('/analytics/income-vs-expense'),
          api.get('/analytics/net-worth'),
        ]);
        setSpending(spendRes.data || []);
        setIncomeVsExpense(iveRes.data || []);
        setNetWorth(nwRes.data || []);
      } catch (err) {
        setError('Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const totalSpend = spending.reduce((s, c) => s + (c.total || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Deep-dive into your financial patterns powered by the analytics API.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spending Breakdown — Pie Chart */}
          <SectionCard title="Spending by Category" loading={loading}>
            {spending.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No spending data available.</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={spending}
                      dataKey="total"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {spending.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <ul className="mt-4 space-y-1 text-sm">
                  {spending
                    .slice()
                    .sort((a, b) => b.total - a.total)
                    .map((c, i) => (
                      <li key={c.category} className="flex justify-between">
                        <span className="flex items-center gap-2">
                          <span
                            className="inline-block w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: COLORS[i % COLORS.length] }}
                          />
                          <span className="text-gray-700 dark:text-gray-300">{c.category}</span>
                        </span>
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {formatCurrency(c.total)}{' '}
                          <span className="text-gray-400 font-normal text-xs">
                            ({totalSpend > 0 ? Math.round((c.total / totalSpend) * 100) : 0}%)
                          </span>
                        </span>
                      </li>
                    ))}
                </ul>
              </>
            )}
          </SectionCard>

          {/* Income vs Expense — Bar Chart */}
          <SectionCard title="Income vs Expenses (Monthly)" loading={loading}>
            {incomeVsExpense.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No monthly data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={incomeVsExpense} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </SectionCard>

          {/* Net Worth Over Time — Line Chart (full width) */}
          <div className="lg:col-span-2">
            <SectionCard title="Net Worth Over Time" loading={loading}>
              {netWorth.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No net worth data available.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={netWorth} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="netWorth"
                      name="Net Worth"
                      stroke="#3b82f6"
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
