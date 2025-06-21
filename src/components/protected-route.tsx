import { useAuth } from '@/context/auth-context';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}