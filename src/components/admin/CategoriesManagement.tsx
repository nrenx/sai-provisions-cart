
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from '@/components/ui/table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { CategoryFromSupabase } from '@/types/supabase';
import ImageUpload from './ImageUpload';

// Category form schema
const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

const CategoriesManagement: React.FC = () => {
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const queryClient = useQueryClient();
  
  // Initialize form
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
    }
  });

  // Fetch categories
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Upload image to Supabase storage
  const uploadImage = async (file: File): Promise<string> => {
    setIsUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `category-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product_images')
        .upload(fileName, file);
        
      if (uploadError) throw uploadError;
      
      return fileName;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Add category mutation
  const addCategoryMutation = useMutation({
    mutationFn: async (values: CategoryFormValues) => {
      // Handle image upload if there's a new image
      let imagePath = null;
      
      if (imageFile) {
        imagePath = await uploadImage(imageFile);
      }
      
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name: values.name,
          image_url: imagePath
        }])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Success",
        description: "Category added successfully",
      });
      setIsAddCategoryOpen(false);
      form.reset();
      setImageFile(null);
      setImagePreview(null);
    },
    onError: (error) => {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: "Failed to add category. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      // Delete associated image if exists
      const category = categories?.find(cat => cat.id === categoryId);
      if (category?.image_url) {
        await supabase.storage
          .from('product_images')
          .remove([category.image_url]);
      }
      
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);
        
      if (error) throw error;
      return categoryId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Also refresh products as categories may have changed
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category. It may be in use by products.",
        variant: "destructive"
      });
    }
  });

  // Form submission handler
  const onSubmit = (values: CategoryFormValues) => {
    addCategoryMutation.mutate(values);
  };

  // Handle file selection
  const handleFileChange = (file: File | null) => {
    setImageFile(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleDelete = (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category? Products in this category will be set to uncategorized.')) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Categories</h2>
        <Button onClick={() => setIsAddCategoryOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>
      
      {/* Categories List */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Products</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  Loading categories...
                </TableCell>
              </TableRow>
            ) : categories && categories.length > 0 ? (
              categories.map((category: CategoryFromSupabase) => (
                <TableRow key={category.id}>
                  <TableCell>
                    {category.image_url ? (
                      <img 
                        src={`${supabase.storageUrl}/object/public/product_images/${category.image_url}`}
                        alt={category.name} 
                        className="w-10 h-10 rounded object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xs">
                        No image
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-right">
                    {/* This would ideally show product count */}
                    <Button variant="link" size="sm" className="h-auto p-0">
                      View Products
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="text-red-500" 
                      onClick={() => handleDelete(category.id)}
                      disabled={deleteCategoryMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No categories found. Add your first category!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Add Category Dialog */}
      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Category Image */}
              <div className="flex flex-col items-center gap-4">
                <ImageUpload 
                  imagePreview={imagePreview}
                  onFileChange={handleFileChange}
                  uploading={isUploading}
                />
              </div>
              
              {/* Category Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter category name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddCategoryOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={addCategoryMutation.isPending || isUploading}
                >
                  {(addCategoryMutation.isPending || isUploading) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add Category
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoriesManagement;
