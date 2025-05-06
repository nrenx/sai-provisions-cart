
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminAuth = () => {
      try {
        setIsLoading(true);
        setError(null);
        const storedSession = localStorage.getItem('adminSession');
        
        if (!storedSession) {
          setIsAdmin(false);
          setAdminData(null);
          return;
        }

        try {
          const session: AdminSession = JSON.parse(storedSession);
          const now = new Date().getTime();
          
          // Check if session is expired
          if (now > session.expiresAt) {
            // Session expired, clear it
            localStorage.removeItem('adminSession');
            setIsAdmin(false);
            setAdminData(null);
            return;
          }

          // Valid session
          setIsAdmin(true);
          setAdminData({
            id: session.id,
            email: session.email,
            name: session.name
          });
        } catch (parseError) {
          console.error('Error parsing admin session:', parseError);
          localStorage.removeItem('adminSession');
          setIsAdmin(false);
          setAdminData(null);
          setError('Session data is invalid');
        }
      } catch (error: any) {
        console.error('Error checking admin auth:', error);
        setIsAdmin(false);
        setAdminData(null);
        setError(error.message || 'Authentication error');
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
    try {
      localStorage.removeItem('adminSession');
      setIsAdmin(false);
      setAdminData(null);
    } catch (error: any) {
      console.error('Error during logout:', error);
      setError(error.message || 'Logout error');
    }
  };

  return { isAdmin, isLoading, adminData, logout, error };
};
