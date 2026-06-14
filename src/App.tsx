import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import CorridorDetail from '@/pages/CorridorDetail';
import AlertsList from '@/pages/AlertsList';
import AlertDetailPage from '@/pages/AlertDetailPage';
import InspectionManagement from '@/pages/InspectionManagement';
import RiskPrediction from '@/pages/RiskPrediction';
import ReportsList from '@/pages/ReportsList';
import ReportDetail from '@/pages/ReportDetail';
import UserManagement from '@/pages/UserManagement';
import AppLayout from '@/components/layout/AppLayout';
import { hasRole } from '@/utils/permission';
import type { UserRole } from '@/types';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, restoreAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      restoreAuth();
    }
  }, [user, restoreAuth]);

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

function RequireRole({ children, role }: { children: React.ReactNode; role: UserRole }) {
  const { user } = useAuthStore();

  if (!user || !hasRole(user, role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const { restoreAuth } = useAuthStore();

  useEffect(() => {
    restoreAuth();
  }, [restoreAuth]);

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnly>
              <Login />
            </PublicOnly>
          }
        />

        <Route
          path="/"
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="corridor/:id" element={<CorridorDetail />} />
          <Route path="alerts" element={<AlertsList />} />
          <Route path="alerts/:id" element={<AlertDetailPage />} />
          <Route path="inspection" element={<InspectionManagement />} />
          <Route path="inspection/risk" element={<RiskPrediction />} />
          <Route path="reports" element={<ReportsList />} />
          <Route path="reports/:id" element={<ReportDetail />} />
          <Route
            path="system/users"
            element={
              <RequireRole role="hq_director">
                <UserManagement />
              </RequireRole>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
