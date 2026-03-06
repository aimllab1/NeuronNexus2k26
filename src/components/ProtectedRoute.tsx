import { Navigate, useLocation } from 'react-router-dom';

/**
 * Generic guard for admin routes (1-4).
 * Normally just checks for an active admin_session flag, but the
 * result page (/admin-control-pannel-4) is allowed to be reached
 * directly from the Admin‑1 dashboard without re‑authenticating.
 * A transient key in sessionStorage is used to perform that one‑time
 * bypass; it is cleared immediately after use.
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('admin_session') === 'true';

  // allow one-time bypass when coming from Admin1 button
  const bypass =
    location.pathname === '/admin-control-pannel-4' &&
    sessionStorage.getItem('bypassResultsLogin') === 'true';
  if (bypass) {
    sessionStorage.removeItem('bypassResultsLogin');
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
