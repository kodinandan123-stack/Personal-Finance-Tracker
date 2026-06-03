import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

// Placeholder pages - to be replaced in future steps
const Dashboard = () => <div className="p-8"><h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>h1></div>div>
  const Login = () => <div className="p-8"><h1 className="text-2xl font-bold text-gray-800">Login</h1>h1></div>div>
  const Register = () => <div className="p-8"><h1 className="text-2xl font-bold text-gray-800">Register</h1>h1></div>div>
  const Transactions = () => <div className="p-8"><h1 className="text-2xl font-bold text-gray-800">Transactions</h1>h1></div>div>
  const Goals = () => <div className="p-8"><h1 className="text-2xl font-bold text-gray-800">Savings Goals</h1>h1></div>div>
  
  function App() {
      return (
            <Router>
                  <Routes>
                          <Route path="/" element={<Navigate to="/dashboard" replace />} />
                          <Route path="/login" element={<Login />} />
                          <Route path="/register" element={<Register />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/transactions" element={<Transactions />} />
                          <Route path="/goals" element={<Goals />} />
                  </Routes>Routes>
            </Router>Router>
          )
  }
  
  export default App</div>
