import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function SummaryCard({ title, amount, color, icon }) {
    return (
          <div className={`bg-white rounded-2xl shadow p-6 border-l-4 ${color}`}>
                  <div className="flex items-center justify-between">
                          <div>
                                    <p className="text-sm text-gray-500 font-medium">{title}</p>p>
                                    <p className="text-2xl font-bold text-gray-800 mt-1">
                                                ${amount.toLocaleString()}
                                    </p>p>
                          </div>div>
                          <span className="text-3xl">{icon}</span>span>
                  </div>div>
          </div>div>
        );
}

export default function DashboardPage() {
    const { user } = useContext(AuthContext);
  
    // Placeholder totals - will be replaced with real API data
    const totalIncome = 0;
    const totalExpenses = 0;
    const balance = totalIncome - totalExpenses;
  
    return (
          <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-5xl mx-auto">
                        <h1 className="text-3xl font-bold text-gray-800 mb-1">Dashboard</h1>h1>
                        <p className="text-gray-500 mb-8">
                                  Welcome back, {user?.name || 'User'}!
                        </p>p>
                
                  {/* Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                                  <SummaryCard
                                                title="Total Income"
                                                amount={totalIncome}
                                                color="border-green-500"
                                                icon="💰"
                                              />
                                  <SummaryCard
                                                title="Total Expenses"
                                                amount={totalExpenses}
                                                color="border-red-500"
                                                icon="💸"
                                              />
                                  <SummaryCard
                                                title="Balance"
                                                amount={balance}
                                                color="border-blue-500"
                                                icon="📊"
                                              />
                        </div>div>
                
                  {/* Chart Placeholder */}
                        <div className="bg-white rounded-2xl shadow p-6 mb-8">
                                  <h2 className="text-lg font-semibold text-gray-700 mb-4">Monthly Overview</h2>h2>
                                  <div className="flex items-center justify-center h-48 bg-gray-100 rounded-xl text-gray-400 text-sm">
                                              Chart will appear here once transactions are added
                                  </div>div>
                        </div>div>
                
                  {/* Recent Transactions Placeholder */}
                        <div className="bg-white rounded-2xl shadow p-6">
                                  <h2 className="text-lg font-semibold text-gray-700 mb-4">Recent Transactions</h2>h2>
                                  <div className="flex items-center justify-center h-24 bg-gray-50 rounded-xl text-gray-400 text-sm">
                                              No transactions yet. Add your first one!
                                  </div>div>
                        </div>div>
                </div>div>
          </div>div>
        );
}</div>
