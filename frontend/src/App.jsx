import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import GoalsPage from './pages/GoalsPage';
import BudgetPage from './pages/BudgetPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';
import RecurringPage from './pages/RecurringPage';

function PrivateRoute({ children }) {
    const { user, loading } = useContext(AuthContext);
    if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Loading...</div>div>;
    return user ? children : <Navigate to="/login" replace />;
}

function App() {
    const { user } = useContext(AuthContext);
  
    return (
          <Router>
            {user && <Navbar />}
                <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>PrivateRoute>} />
                                <Route path="/transactions" element={<PrivateRoute><TransactionsPage /></PrivateRoute>PrivateRoute>} />
                                        <Route path="/goals" element={<PrivateRoute><GoalsPage /></PrivateRoute>PrivateRoute>} />
                                                <Route path="/budget" element={<PrivateRoute><BudgetPage /></PrivateRoute>PrivateRoute>} />
                                                        <Route path="/reports" element={<PrivateRoute><ReportsPage /></PrivateRoute>PrivateRoute>} />
                                                                <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>PrivateRoute>} />
                                                                        <Route path="/recurring" element={<PrivateRoute><RecurringPage /></PrivateRoute>PrivateRoute>} />
                                                                        </Route>Routes>
                                                                </Route>Router>
                                                          );
                                                          }
                                                        
                                                        export default App;</div>
