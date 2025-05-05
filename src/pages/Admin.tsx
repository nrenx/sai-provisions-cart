
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductsManagement from '@/components/admin/ProductsManagement';
import CategoriesManagement from '@/components/admin/CategoriesManagement';
import CouponsManagement from '@/components/admin/CouponsManagement';

const Admin: React.FC = () => {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
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
