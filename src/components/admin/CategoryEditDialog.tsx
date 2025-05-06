
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { CategoryFromSupabase } from '@/types/supabase';
import ImageUpload from './ImageUpload';

// Category form schema
const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryFromSupabase | null;
}

const CategoryEditDialog: React.FC<CategoryEditDialogProps> = ({ isOpen, onClose, category }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const queryClient = useQueryClient();
  
  // Initialize form
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || "",
    }
  });

  // Update form values when category changes
  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
      });
      
      if (category.image_url) {
        setImagePreview(supabase.storage.from('product_images').getPublicUrl(category.image_url).data.publicUrl);
      } else {
        setImagePreview(null);
      }
    }
  }, [category, form]);

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

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async (values: CategoryFormValues) => {
      if (!category) throw new Error("No category to update");
      
      // Handle image upload if there's a new image
      let imagePath = category.image_url;
      
      if (imageFile) {
        imagePath = await uploadImage(imageFile);
      }
      
      const { data, error } = await supabase
        .from('categories')
        .update({
          name: values.name,
          image_url: imagePath
        })
        .eq('id', category.id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
      onClose();
      form.reset();
      setImageFile(null);
      setImagePreview(null);
    },
    onError: (error) => {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Form submission handler
  const onSubmit = (values: CategoryFormValues) => {
    updateCategoryMutation.mutate(values);
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
      if (category?.image_url) {
        setImagePreview(supabase.storage.from('product_images').getPublicUrl(category.image_url).data.publicUrl);
      } else {
        setImagePreview(null);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
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
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateCategoryMutation.isPending || isUploading}
              >
                {(updateCategoryMutation.isPending || isUploading) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryEditDialog;
