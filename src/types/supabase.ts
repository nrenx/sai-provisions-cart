
import { Tables } from "@/integrations/supabase/types";

// Product type mapping to our Supabase schema
export type ProductFromSupabase = Tables<"products">;

// Category type mapping to our Supabase schema
export type CategoryFromSupabase = Tables<"categories">;

// Extended product type that includes the category name
export type ProductWithCategory = ProductFromSupabase & {
  category?: CategoryFromSupabase | null;
};
