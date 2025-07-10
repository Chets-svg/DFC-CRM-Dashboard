import { AuthProvider, useAuth } from '@/context/auth-context'; // Make sure this path is correct
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from '@/components/login';
import CRMDashboard from '@/components/crm-dashboard';
import { Toaster } from "@/components/ui/toaster";
import { EmailComponent } from './components/email';
import AuthCallback from './pages/AuthCallback';
import { ThemeProvider } from './components/theme-provider';

function ProtectedRoute() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<CRMDashboard />} />
              <Route path="/emails" element={<EmailComponent />} />
            </Route>
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
          </Routes>
          <Toaster />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;