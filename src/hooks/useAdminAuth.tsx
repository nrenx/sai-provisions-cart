
import { useState, useEffect } from 'react';

interface AdminSession {
  id: string;
  email: string;
  name?: string | null;
  expiresAt: number;
}

export const useAdminAuth = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [adminData, setAdminData] = useState<Omit<AdminSession, 'expiresAt'> | null>(null);

  useEffect(() => {
    const checkAdminAuth = () => {
      try {
        setIsLoading(true);
        const storedSession = localStorage.getItem('adminSession');
        
        if (!storedSession) {
          setIsAdmin(false);
          return;
        }

        const session: AdminSession = JSON.parse(storedSession);
        const now = new Date().getTime();
        
        // Check if session is expired
        if (now > session.expiresAt) {
          // Session expired, clear it
          localStorage.removeItem('adminSession');
          setIsAdmin(false);
          return;
        }

        // Valid session
        setIsAdmin(true);
        setAdminData({
          id: session.id,
          email: session.email,
          name: session.name
        });
      } catch (error) {
        console.error('Error checking admin auth:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAuth();
    // Add event listener for storage changes (in case another tab logs out)
    window.addEventListener('storage', checkAdminAuth);
    
    return () => {
      window.removeEventListener('storage', checkAdminAuth);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem('adminSession');
    setIsAdmin(false);
    setAdminData(null);
  };

  return { isAdmin, isLoading, adminData, logout };
};
