import { useState, useEffect } from 'react';
import api from '../services/api';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const ReportsPage = () => {
  const [summary, setSummary] = useState(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchReportData();
  }, [selectedYear]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [summaryRes, breakdownRes, trendRes] = await Promise.all([
        api.get(`/transactions/summary?year=${selectedYear}`),
        api.get(`/transactions/category-breakdown?year=${selectedYear}`),
        api.get(`/transactions/monthly-trend?year=${selectedYear}`),
      ]);
      setSummary(summaryRes.data);
      setCategoryBreakdown(breakdownRes.data || []);
      setMonthlyTrend(trendRes.data || []);
    } catch (err) {
      setError('Failed to load report data.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

  const getMaxAmount = () =>
    Math.max(...monthlyTrend.map((m) => Math.max(m.income || 0, m.expenses || 0)), 1);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  if (loading) return <div className="p-6 text-gray-500">Loading reports...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Financial Reports</h1>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <p className="text-sm text-green-600 font-medium">Total Income</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{formatCurrency(summary?.totalIncome)}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <p className="text-sm text-red-600 font-medium">Total Expenses</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{formatCurrency(summary?.totalExpenses)}</p>
        </div>
        <div className={`${(summary?.netSavings || 0) >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} border rounded-xl p-5`}>
          <p className={`text-sm font-medium ${(summary?.netSavings || 0) >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>Net Savings</p>
          <p className={`text-2xl font-bold mt-1 ${(summary?.netSavings || 0) >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>{formatCurrency(summary?.netSavings)}</p>
        </div>
      </div>

      {/* Monthly Trend Bar Chart */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Income vs Expenses ({selectedYear})</h2>
        {monthlyTrend.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No data available for this year.</p>
        ) : (
          <div className="flex items-end gap-2 h-48">
            {MONTHS.map((month, idx) => {
              const data = monthlyTrend.find((m) => m.month === idx + 1) || {};
              const maxAmt = getMaxAmount();
              const incomeH = ((data.income || 0) / maxAmt) * 160;
              const expenseH = ((data.expenses || 0) / maxAmt) * 160;
              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex justify-center gap-0.5 items-end" style={{ height: '160px' }}>
                    <div className="w-2/5 bg-green-400 rounded-t" style={{ height: `${incomeH}px` }} title={`Income: ${formatCurrency(data.income)}`} />
                    <div className="w-2/5 bg-red-400 rounded-t" style={{ height: `${expenseH}px` }} title={`Expenses: ${formatCurrency(data.expenses)}`} />
                  </div>
                  <span className="text-xs text-gray-500">{month.slice(0, 3)}</span>
                </div>
              );
            })}
          </div>
        )}
        <div className="flex gap-4 mt-3 text-sm">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-400 rounded" /> Income</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-400 rounded" /> Expenses</span>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Spending by Category</h2>
        {categoryBreakdown.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No expense data available.</p>
        ) : (
          <div className="space-y-3">
            {categoryBreakdown
              .sort((a, b) => b.total - a.total)
              .map((cat) => {
                const totalExp = categoryBreakdown.reduce((sum, c) => sum + c.total, 0);
                const percent = totalExp > 0 ? Math.round((cat.total / totalExp) * 100) : 0;
                return (
                  <div key={cat.category}>
                    <div className="flex justify-between text-sm text-gray-700 mb-1">
                      <span>{cat.category}</span>
                      <span>{formatCurrency(cat.total)} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
