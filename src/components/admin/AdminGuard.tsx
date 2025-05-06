
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { toast } from '@/components/ui/sonner';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { isAdmin, isLoading, error } = useAdminAuth();
  const location = useLocation();

  React.useEffect(() => {
    if (!isLoading) {
      if (!isAdmin) {
        toast.error("You must be logged in as an admin to access this page");
      }
      if (error) {
        toast.error(error);
      }
    }
  }, [isAdmin, isLoading, error]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!isAdmin) {
    // Save the intended destination for redirect after login
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

export default AdminGuard;
