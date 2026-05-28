import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AppShell } from '@/components/layout/AppShell';
import LandingPage from '@/pages/LandingPage';
import OrdersPage from '@/pages/OrdersPage';
import { OrderDetailPage } from '@/pages/OrderDetailPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { InventoryDashboardPage } from '@/pages/InventoryDashboardPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import type { UserRole } from '@/types/user';

const RequireAuth = ({ children, roles }: { children: JSX.Element; roles?: UserRole[] }): JSX.Element => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return <div className="grid min-h-screen place-items-center text-slate-500">Loading…</div>;
  }
  if (!user) {
    return <Navigate to="/" replace />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/orders" replace />;
  }
  return children;
};

const HomeRedirect = (): JSX.Element => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return <div className="grid min-h-screen place-items-center text-slate-500">Loading…</div>;
  }
  if (!user) return <LandingPage />;
  return <Navigate to={user.role === 'employee' ? '/orders' : '/dashboard'} replace />;
};

const App = (): JSX.Element => (
  <Routes>
    <Route path="/" element={<HomeRedirect />} />
    <Route
      element={
        <RequireAuth>
          <AppShell />
        </RequireAuth>
      }
    >
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/orders/:id" element={<OrderDetailPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route
        path="/dashboard"
        element={
          <RequireAuth roles={['manager', 'admin']}>
            <DashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="/inventory-dashboard"
        element={
          <RequireAuth roles={['manager', 'admin']}>
            <InventoryDashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="/settings"
        element={
          <RequireAuth roles={['manager', 'admin']}>
            <SettingsPage />
          </RequireAuth>
        }
      />
    </Route>
    <Route
      path="/reset-password"
      element={
        <div className="grid min-h-screen place-items-center bg-slate-50 p-4">
          <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <ResetPasswordForm />
          </div>
        </div>
      }
    />
    <Route path="/404" element={<NotFoundPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default App;
