import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Dashboard from '../pages/Dashboard';
import TicketListPage from '../features/tickets/TicketListPage';
import CreateTicketPage from '../features/tickets/CreateTicketPage';
import LoginPage from '../features/auth/LoginPage';
import ProtectedRoute from './ProtectedRoute';
import TicketDetailPage from '../features/tickets/TicketDetailPage';
import AgentManagement from '../pages/AgentManagement';
import PublicRoute from './PublicRoute';

const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      { path: '/', element: <LoginPage /> },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['CUSTOMER']} />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardLayout />,
        children: [
          { path: 'tickets', element: <TicketListPage /> },
          { path: 'tickets/:id', element: <TicketDetailPage /> },
          { path: 'create-ticket', element: <CreateTicketPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['ADMIN']} />,
    children: [
      { 
        path: '/dashboard',
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'tickets', element: <TicketListPage /> },
          { path: 'tickets/:id', element: <TicketDetailPage /> },
          { path: 'agents', element: <AgentManagement /> },
          { path: 'settings', element: <div>Settings Coming Soon</div> },
        ],
      },
    ],
  },
]);
export default function AppRouter() {
  return <RouterProvider router={router} />;
}
