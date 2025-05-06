
import { supabase } from './client';

/**
 * Initialize required storage buckets for the application
 */
export const initializeStorage = async () => {
  try {
    // Check if product_images bucket exists
    const { data: buckets, error } = await supabase
      .storage
      .listBuckets();
    
    if (error) {
      console.error('Error checking storage buckets:', error);
      return;
    }
    
    const productBucketExists = buckets.some(bucket => bucket.name === 'product_images');
    
    // Create product_images bucket if it doesn't exist
    if (!productBucketExists) {
      const { error: createError } = await supabase
        .storage
        .createBucket('product_images', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
        });
      
      if (createError) {
        console.error('Error creating product_images bucket:', createError);
      } else {
        console.log('Created product_images storage bucket');
      }
    }
  } catch (err) {
    console.error('Unexpected error initializing storage:', err);
  }
};

// Call this function when the app starts
initializeStorage();
