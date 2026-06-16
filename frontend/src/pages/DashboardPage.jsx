import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

function SummaryCard({ title, amount, color, icon, loading }) {
    return (
          <div className={`bg-white rounded-2xl shadow p-6 border-l-4 ${color}`}>
                  <div className="flex items-center justify-between">
                          <div>
                                    <p className="text-sm text-gray-500 font-medium">{title}</p>p>
                            {loading ? (
                        <div className="h-8 w-24 bg-gray-100 rounded animate-pulse mt-1" />
                      ) : (
                        <p className="text-2xl font-bold text-gray-800 mt-1">
                                      ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>p>
                                    )}
                          </div>div>
                          <span className="text-3xl">{icon}</span>span>
                  </div>div>
          </div>div>
        );
}

function RecentTransactionRow({ t }) {
    const isIncome = t.type === 'income';
    return (
          <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                        <span className={`text-xl ${isIncome ? 'text-green-500' : 'text-red-400'}`}>
                          {isIncome ? '💰' : '💸'}
                        </span>span>
                        <div>
                                  <p className="font-medium text-gray-800 text-sm">{t.category}</p>p>
                                  <p className="text-xs text-gray-400">
                                    {t.description || '—'} · {new Date(t.date).toLocaleDateString()}
                                  </p>p>
                        </div>div>
                </div>div>
                <span className={`font-semibold text-sm ${isIncome ? 'text-green-600' : 'text-red-500'}`}>
                  {isIncome ? '+' : '-'}${t.amount.toLocaleString()}
                </span>span>
          </div>div>
        );
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function DashboardPage() {
    const { user } = useContext(AuthContext);
    const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, balance: 0 });
    const [recent, setRecent] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
  
    useEffect(() => {
          const fetchData = async () => {
                  try {
                            setLoading(true);
                            const [summaryRes, txRes, dashRes] = await Promise.all([
                                        API.get('/transactions/summary'),
                                        API.get('/transactions?limit=5'),
                                        API.get('/dashboard').catch(() => ({ data: null })),
                                      ]);
                            setSummary(summaryRes.data);
                            setRecent(txRes.data.slice(0, 5));
                    
                            // Build monthly chart data from dashboard or summary monthly breakdown
                            if (dashRes.data?.monthlyBreakdown) {
                                        const chartData = dashRes.data.monthlyBreakdown.map((item) => ({
                                                      month: MONTH_LABELS[item.month - 1] || item.month,
                                                      Income: item.income || 0,
                                                      Expenses: item.expenses || 0,
                                        }));
                                        setMonthlyData(chartData);
                            } else if (summaryRes.data?.monthlyBreakdown) {
                                        const chartData = summaryRes.data.monthlyBreakdown.map((item) => ({
                                                      month: MONTH_LABELS[item.month - 1] || item.month,
                                                      Income: item.income || 0,
                                                      Expenses: item.expenses || 0,
                                        }));
                                        setMonthlyData(chartData);
                            }
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
                        <h1 className="text-3xl font-bold text-gray-800 mb-1">Dashboard</h1>h1>
                        <p className="text-gray-500 mb-8">Welcome back, {user?.name || 'User'}!</p>p>
                
                  {error && (
                      <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-6 text-sm">
                        {error}
                      </div>div>
                        )}
                
                  {/* Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                                  <SummaryCard title="Total Income" amount={summary.totalIncome} color="border-green-500" icon="💰" loading={loading} />
                                  <SummaryCard title="Total Expenses" amount={summary.totalExpenses} color="border-red-500" icon="💸" loading={loading} />
                                  <SummaryCard title="Balance" amount={summary.balance} color="border-blue-500" icon="📊" loading={loading} />
                        </div>div>
                
                  {/* Monthly Chart */}
                  {!loading && monthlyData.length > 0 && (
                      <div className="bg-white rounded-2xl shadow p-6 mb-8">
                                  <h2 className="text-lg font-semibold text-gray-700 mb-4">Monthly Income vs Expenses</h2>h2>
                                  <ResponsiveContainer width="100%" height={280}>
                                                <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
                                                                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(v) => `$${v}`} />
                                                                <Tooltip
                                                                                    formatter={(value) => [`$${value.toLocaleString()}`, undefined]}
                                                                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                                                                                  />
                                                                <Legend wrapperStyle={{ fontSize: '13px' }} />
                                                                <Bar dataKey="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                                                <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                                </BarChart>BarChart>
                                  </ResponsiveContainer>ResponsiveContainer>
                      </div>div>
                        )}
                
                  {/* Recent Transactions */}
                        <div className="bg-white rounded-2xl shadow p-6">
                                  <div className="flex items-center justify-between mb-4">
                                              <h2 className="text-lg font-semibold text-gray-700">Recent Transactions</h2>h2>
                                              <a href="/transactions" className="text-sm text-green-600 hover:underline font-medium">
                                                            View all →
                                              </a>a>
                                  </div>div>
                        
                          {loading ? (
                        <div className="space-y-3">
                          {[1,2,3].map(i => (
                                          <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                                        ))}
                        </div>div>
                      ) : recent.length === 0 ? (
                        <div className="flex items-center justify-center h-24 bg-gray-50 rounded-xl text-gray-400 text-sm">
                                      No transactions yet. <a href="/transactions" className="ml-1 text-green-500 hover:underline">Add your first one!</a>a>
                        </div>div>
                      ) : (
                        <div>
                          {recent.map(t => <RecentTransactionRow key={t._id} t={t} />)}
                        </div>div>
                                  )}
                        </div>div>
                </div>div>
          </div>div>
        );
}</div>
