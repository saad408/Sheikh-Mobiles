import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { getMe } from '@/api/auth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, setAuth, logout } = useAuthStore();
  const location = useLocation();
  const [checking, setChecking] = useState(!!token);

  useEffect(() => {
    if (!token) {
      setChecking(false);
      return;
    }
    getMe(token)
      .then((res) => {
        setAuth(token, res.admin);
        setChecking(false);
      })
      .catch(() => {
        logout();
        setChecking(false);
      });
  }, [token, setAuth, logout]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
