import { AuthProvider } from '@/context/auth-context';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from '@/components/login';
import CRMDashboard from '@/components/crm-dashboard';
import { Toaster } from "@/components/ui/toaster";
import { EmailComponent } from './components/email';
import AuthCallback from './pages/AuthCallback'; // 👈 You missed this line
import { ThemeProvider } from './components/theme-provider'; // Adjusted import path

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<CRMDashboard />} />
            <Route path="/" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/emails" element={<EmailComponent />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;