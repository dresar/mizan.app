import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { jwtDecode } from 'jwt-decode';
import { useEffect } from 'react';
export default function ProtectedRoute() {
  const { isAuthenticated, token, logout } = useAuthStore();
  const location = useLocation();
  useEffect(() => {
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          logout();
        }
      } catch (e) {
        logout();
      }
    }
  }, [token, logout]);
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/admin-cms') || location.pathname.startsWith('/dashboard')) {
    const allowedRoles = [
      'superadmin',
      'admin',
      'adminwebsite',
      'operator',
      'staff',
      'petugaspendaftaran',
      'bendahara',
      'author',
    ];
    const userRole = useAuthStore.getState().user?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      if (userRole === 'santri' || userRole === 'user') {
        const identifier = useAuthStore.getState().user?.username || useAuthStore.getState().user?.id;
        return <Navigate to={`/santri/dashboard/${identifier}`} replace />;
      }
      logout();
      return <Navigate to="/login" replace />;
    }
  }
  return <Outlet />;
}