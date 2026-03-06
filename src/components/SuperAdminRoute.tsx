import { Navigate } from 'react-router-dom';

/**
 * Protects Admin 5 routes only.
 * Requires:
 * - super_admin_session = true
 * - admin_user = admin5
 */
const SuperAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated =
    localStorage.getItem('super_admin_session') === 'true' &&
    localStorage.getItem('admin_user') === 'admin5';

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default SuperAdminRoute;
