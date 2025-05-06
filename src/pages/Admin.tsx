
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductsManagement from '@/components/admin/ProductsManagement';
import CategoriesManagement from '@/components/admin/CategoriesManagement';
import CouponsManagement from '@/components/admin/CouponsManagement';
import AdminHeader from '@/components/admin/AdminHeader';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const Admin: React.FC = () => {
  const { isAdmin } = useAdminAuth();
  
  // This is a second safety check in addition to AdminGuard
  if (!isAdmin) {
    return null; // AdminGuard will handle the redirect
  }

  return (
    <div className="container py-8">
      <AdminHeader />
      
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="mb-6 bg-gray-100">
          <TabsTrigger 
            value="products"
            className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
          >
            Products
          </TabsTrigger>
          <TabsTrigger 
            value="categories"
            className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
          >
            Categories
          </TabsTrigger>
          <TabsTrigger 
            value="coupons"
            className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
          >
            Coupons
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="products">
          <ProductsManagement />
        </TabsContent>
        
        <TabsContent value="categories">
          <CategoriesManagement />
        </TabsContent>

        <TabsContent value="coupons">
          <CouponsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
