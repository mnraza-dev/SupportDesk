import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Dashboard from '../pages/Dashboard';
import TicketListPage from '../features/tickets/TicketList';
// import TicketDetailPage from '../features/tickets/TicketDetailPage';
import LoginPage from '../features/auth/LoginPage';
// import NotFound from '../pages/NotFound';
import ProtectedRoute from './ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute allowedRoles={['ADMIN', 'AGENT']} />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'tickets', element: <TicketListPage /> },
          // { path: 'tickets/:id', element: <TicketDetailPage /> },
          { path: 'agents', element: <div>Agent Management Coming Soon</div> },
          { path: 'settings', element: <div>Settings Coming Soon</div> },
        ],
      },
    ],
  },
  // { path: '*', element: <NotFound /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
