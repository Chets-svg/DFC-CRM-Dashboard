import { AuthProvider } from '@/context/auth-context';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from '@/components/login';
import CRMDashboard from '@/components/crm-dashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<CRMDashboard />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

