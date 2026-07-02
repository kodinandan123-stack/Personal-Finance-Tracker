import { useEffect, useState } from 'react';
import { getInvestments, createInvestment, updateInvestment, deleteInvestment } from '../services/api';

export default function InvestmentsPage() {
    const [investments, setInvestments] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
          name: '', type: 'stock', symbol: '', shares: '',
          purchasePrice: '', currentPrice: '', purchaseDate: '',
    });

  const fetchData = async () => {
        setLoading(true);
        try {
                const res = await getInvestments();
                setInvestments(res.data.investments || res.data);
                setSummary(res.data.summary || null);
        } catch {
                setError('Failed to load investments.');
        } finally {
                setLoading(false);
        }
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
        setForm({ name: '', type: 'stock', symbol: '', shares: '', purchasePrice: '', currentPrice: '', purchaseDate: '' });
        setEditing(null);
        setShowForm(false);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
        e.preventDefault();
        try {
                if (editing) {
                          await updateInvestment(editing._id, form);
                } else {
                          await createInvestment(form);
                }
                resetForm();
                fetchData();
        } catch {
                setError('Failed to save investment.');
        }
  };

  const handleEdit = (inv) => {
        setEditing(inv);
        setForm({
                name: inv.name, type: inv.type, symbol: inv.symbol || '',
                shares: inv.shares, purchasePrice: inv.purchasePrice,
                currentPrice: inv.currentPrice, purchaseDate: inv.purchaseDate?.slice(0, 10) || '',
        });
        setShowForm(true);
  };

  const handleDelete = async (id) => {
        if (!window.confirm('Delete this investment?')) return;
        try { await deleteInvestment(id); fetchData(); } catch { setError('Failed to delete.'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading investments...</div>div>;
  
    const TYPES = ['stock', 'etf', 'crypto', 'bond', 'mutual_fund', 'real_estate', 'other'];
  
    return (
          <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-white">Investments</h1>h1>
                        <button
                                    onClick={() => { setShowForm(!showForm); resetForm(); }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                                  >
                          {showForm ? 'Cancel' : '+ Add Investment'}
                        </button>button>
                </div>div>
          
            {error && <p className="text-red-400 mb-4">{error}</p>p>}
          
            {summary && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      {[
                      { label: 'Total Cost', value: `$${summary.totalCost?.toFixed(2) ?? '—'}` },
                      { label: 'Market Value', value: `$${summary.totalMarketValue?.toFixed(2) ?? '—'}` },
                      { label: 'Gain / Loss', value: `$${summary.totalGainLoss?.toFixed(2) ?? '—'}` },
                      { label: 'Return', value: `${summary.returnPercent?.toFixed(2) ?? '—'}%` },
                                ].map(({ label, value }) => (
                                              <div key={label} className="bg-gray-800 rounded-xl p-4">
                                                            <p className="text-xs text-gray-400 mb-1">{label}</p>p>
                                                            <p className="text-lg font-semibold text-white">{value}</p>p>
                                              </div>div>
                                            ))}
                    </div>div>
                )}
          
            {showForm && (
                    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                      { name: 'name', placeholder: 'Investment Name', type: 'text' },
                      { name: 'symbol', placeholder: 'Ticker Symbol (e.g. AAPL)', type: 'text' },
                      { name: 'shares', placeholder: 'Shares / Units', type: 'number' },
                      { name: 'purchasePrice', placeholder: 'Purchase Price ($)', type: 'number' },
                      { name: 'currentPrice', placeholder: 'Current Price ($)', type: 'number' },
                      { name: 'purchaseDate', placeholder: 'Purchase Date', type: 'date' },
                                ].map(({ name, placeholder, type }) => (
                                              <input key={name} name={name} placeholder={placeholder} type={type}
                                                              value={form[name]} onChange={handleChange}
                                                              className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                              required={['name', 'shares', 'purchasePrice', 'currentPrice'].includes(name)}
                                                              step={['shares', 'purchasePrice', 'currentPrice'].includes(name) ? '0.0001' : undefined}
                                                            />
                                            ))}
                              <div>
                                          <select name="type" value={form.type} onChange={handleChange}
                                                          className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        >
                                            {TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>option>)}
                                          </select>select>
                              </div>div>
                              <div className="flex items-end justify-end">
                                          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium">
                                            {editing ? 'Update' : 'Add Investment'}
                                          </button>button>
                              </div>div>
                    </form>form>
                )}
          
            {investments.length === 0 ? (
                    <p className="text-gray-400 text-center py-12">No investments yet. Add your first one above.</p>p>
                  ) : (
                    <div className="overflow-x-auto rounded-xl">
                              <table className="w-full text-sm text-left text-gray-300">
                                          <thead className="text-xs uppercase text-gray-400 border-b border-gray-700 bg-gray-800">
                                                        <tr>
                                                          {['Name', 'Type', 'Symbol', 'Shares', 'Buy $', 'Current $', 'Gain / Loss', ''].map(h => (
                                        <th key={h} className="py-3 px-4">{h}</th>th>
                                      ))}
                                                        </tr>tr>
                                          </thead>thead>
                                          <tbody>
                                            {investments.map(inv => {
                                      const gl = ((inv.currentPrice - inv.purchasePrice) * inv.shares).toFixed(2);
                                      const pos = Number(gl) >= 0;
                                      return (
                                                          <tr key={inv._id} className="border-b border-gray-800 hover:bg-gray-800 transition-colors">
                                                                              <td className="py-3 px-4 font-medium text-white">{inv.name}</td>td>
                                                                              <td className="py-3 px-4 capitalize">{inv.type?.replace('_', ' ')}</td>td>
                                                                              <td className="py-3 px-4">{inv.symbol || '—'}</td>td>
                                                                              <td className="py-3 px-4">{inv.shares}</td>td>
                                                                              <td className="py-3 px-4">${Number(inv.purchasePrice).toFixed(2)}</td>td>
                                                                              <td className="py-3 px-4">${Number(inv.currentPrice).toFixed(2)}</td>td>
                                                                              <td className={`py-3 px-4 font-medium ${pos ? 'text-green-400' : 'text-red-400'}`}>
                                                                                {pos ? '+' : ''}${gl}
                                                                              </td>td>
                                                                              <td className="py-3 px-4 flex gap-2">
                                                                                                    <button onClick={() => handleEdit(inv)} className="text-blue-400 hover:text-blue-300 text-xs">Edit</button>button>
                                                                                                    <button onClick={() => handleDelete(inv._id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>button>
                                                                              </td>td>
                                                          </tr>tr>
                                                        );
                    })}
                                          </tbody>tbody>
                              </table>table>
                    </div>div>
                )}
          </div>div>
        );
}</div>
