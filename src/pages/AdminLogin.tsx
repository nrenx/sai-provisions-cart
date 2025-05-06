
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import * as bcrypt from 'bcryptjs';

// Form validation schema
const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

type FormValues = z.infer<typeof formSchema>;

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [adminExists, setAdminExists] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  // Check if any admin accounts exist
  useEffect(() => {
    const checkAdminExists = async () => {
      try {
        const { count, error } = await supabase
          .from('admins')
          .select('*', { count: 'exact', head: true });
        
        if (error) throw error;
        
        // If no admins exist, show registration form
        if (count === 0) {
          setAdminExists(false);
          setIsRegistering(true);
        }
      } catch (error) {
        console.error('Error checking admin accounts:', error);
        toast.error('Failed to connect to server');
      }
    };

    checkAdminExists();
  }, []);

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true);
    
    try {
      if (isRegistering) {
        // Register first admin account
        const hashedPassword = await bcrypt.hash(values.password, 10);
        
        const { error } = await supabase
          .from('admins')
          .insert([
            { email: values.email, password: hashedPassword }
          ]);
        
        if (error) throw error;
        
        toast.success('Admin account created successfully');
        setIsRegistering(false);
        form.reset();
      } else {
        // Login existing admin
        const { data, error } = await supabase
          .from('admins')
          .select('*')
          .eq('email', values.email)
          .single();
        
        if (error) throw error;
        
        if (!data) {
          toast.error('Invalid email or password');
          return;
        }
        
        const isPasswordValid = await bcrypt.compare(values.password, data.password);
        
        if (!isPasswordValid) {
          toast.error('Invalid email or password');
          return;
        }
        
        // Store admin session in localStorage
        localStorage.setItem('adminSession', JSON.stringify({
          id: data.id,
          email: data.email,
          name: data.name,
          expiresAt: new Date().getTime() + (24 * 60 * 60 * 1000) // 24 hours
        }));
        
        toast.success('Login successful');
        navigate('/admin');
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {isRegistering ? 'Create Admin Account' : 'Admin Login'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isRegistering 
              ? 'Set up your admin credentials' 
              : 'Sign in to access the admin dashboard'}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="admin@example.com" 
                      type="email" 
                      autoComplete="email"
                      disabled={isLoading} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="••••••••" 
                      type="password"
                      autoComplete={isRegistering ? 'new-password' : 'current-password'}
                      disabled={isLoading} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-green-500 hover:bg-green-600" 
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : isRegistering ? 'Create Account' : 'Sign In'}
            </Button>

            {adminExists && !isRegistering && (
              <p className="text-sm text-center text-gray-500">
                Don't have an account?{' '}
                <button
                  type="button"
                  className="text-green-600 hover:text-green-800"
                  onClick={() => setIsRegistering(true)}
                >
                  Register
                </button>
              </p>
            )}

            {isRegistering && adminExists && (
              <p className="text-sm text-center text-gray-500">
                Already have an account?{' '}
                <button
                  type="button"
                  className="text-green-600 hover:text-green-800"
                  onClick={() => setIsRegistering(false)}
                >
                  Sign in
                </button>
              </p>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AdminLogin;
