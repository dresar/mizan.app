import { useAuthStore } from "@/stores/auth-store";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const AuthorProtectedRoute = () => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const allowedRoles = ['author', 'editor', 'reviewer', 'superadmin'];
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default AuthorProtectedRoute;
