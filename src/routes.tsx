import { createBrowserRouter } from 'react-router-dom';
import Login from '@/components/login';
import CRMDashboard from '@/components/crm-dashboard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/dashboard',
    element: <CRMDashboard />,
  },
]);