
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

const AdminHeader: React.FC = () => {
  const { adminData, logout } = useAdminAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex justify-between items-center mb-6 pb-4 border-b">
      <div>
        <h1 className="text-3xl font-bold text-green-600">Admin Dashboard</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center text-sm text-gray-600">
          <User className="mr-2 h-4 w-4" />
          <span>{adminData?.email}</span>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLogout}
          className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default AdminHeader;
