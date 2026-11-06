import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { jwtDecode } from 'jwt-decode';
import { useEffect } from 'react';
import { toast } from 'sonner';
export default function SantriProtectedRoute() {
  const { isAuthenticated, token, user, logout } = useAuthStore();
  const location = useLocation();
  const { santriId } = useParams();
  useEffect(() => {
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          logout();
          toast.error('Sesi Anda telah berakhir. Silakan login kembali.');
        }
      } catch (e) {
        logout();
      }
    }
  }, [token, logout]);
  if (!isAuthenticated || !token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (user.role !== 'santri' && user.role !== 'user') {
    toast.error('Anda tidak memiliki akses ke halaman ini.');
    return <Navigate to="/dashboard" replace />;
  }
  if (santriId) {
    const userIdentifier = (user as any).username || user.id;
    if (santriId !== userIdentifier) {
      const correctPath = location.pathname.replace(santriId, userIdentifier);
      return <Navigate to={correctPath} replace />;
    }
  }
  return <Outlet />;
}