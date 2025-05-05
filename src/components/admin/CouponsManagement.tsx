
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from '@/components/ui/table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Plus, Trash2, Calendar, Badge, Percent, Edit } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CouponFromSupabase } from '@/types/supabase';
import { Textarea } from '@/components/ui/textarea';
import { Badge as BadgeComponent } from '@/components/ui/badge';

// Coupon form schema
const couponSchema = z.object({
  code: z.string().min(3, "Coupon code must be at least 3 characters"),
  discount_amount: z.coerce.number().min(1, "Discount must be at least 1"),
  is_percentage: z.boolean().default(false),
  start_date: z.date(),
  expiry_date: z.date(),
  usage_limit: z.coerce.number().nullable().optional(),
  success_message: z.string().optional(),
  active: z.boolean().default(true),
}).refine(data => {
  return data.start_date <= data.expiry_date;
}, {
  message: "Start date must be before or equal to expiry date",
  path: ["expiry_date"],
}).refine(data => {
  if (data.is_percentage) {
    return data.discount_amount <= 100;
  }
  return true;
}, {
  message: "Percentage discount cannot exceed 100%",
  path: ["discount_amount"],
});

type CouponFormValues = z.infer<typeof couponSchema>;

const CouponsManagement: React.FC = () => {
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponFromSupabase | null>(null);
  
  const queryClient = useQueryClient();
  
  // Initialize form
  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: "",
      discount_amount: 10,
      is_percentage: true,
      start_date: new Date(),
      expiry_date: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Default to 1 month validity
      usage_limit: null,
      success_message: "Coupon applied successfully!",
      active: true,
    }
  });

  // Fetch coupons
  const { data: coupons, isLoading } = useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Add/Edit coupon mutation
  const couponMutation = useMutation({
    mutationFn: async (values: CouponFormValues) => {
      const couponData = {
        code: values.code.toUpperCase(), // Store codes in uppercase
        discount_amount: values.discount_amount,
        is_percentage: values.is_percentage,
        start_date: values.start_date.toISOString(),
        expiry_date: values.expiry_date.toISOString(),
        usage_limit: values.usage_limit,
        success_message: values.success_message || "Coupon applied successfully!",
        active: values.active,
        updated_at: new Date().toISOString(),
      };

      if (editingCoupon) {
        // Update existing coupon
        const { error } = await supabase
          .from('coupons')
          .update(couponData)
          .eq('id', editingCoupon.id);
          
        if (error) throw error;
        return { ...couponData, id: editingCoupon.id };
      } else {
        // Add new coupon
        const { data, error } = await supabase
          .from('coupons')
          .insert({
            ...couponData,
            usage_count: 0,
          })
          .select()
          .single();
          
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success(`Coupon ${editingCoupon ? 'updated' : 'added'} successfully`);
      handleCloseForm();
    },
    onError: (error) => {
      console.error('Error saving coupon:', error);
      toast.error(`Failed to ${editingCoupon ? 'update' : 'add'} coupon. Please try again.`);
    }
  });

  // Delete coupon mutation
  const deleteCouponMutation = useMutation({
    mutationFn: async (couponId: string) => {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', couponId);
        
      if (error) throw error;
      return couponId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success("Coupon deleted successfully");
    },
    onError: (error) => {
      console.error('Error deleting coupon:', error);
      toast.error("Failed to delete coupon. Please try again.");
    }
  });

  // Close form and reset state
  const handleCloseForm = () => {
    setIsAddCouponOpen(false);
    setEditingCoupon(null);
    form.reset();
  };

  // Edit coupon handler
  const handleEditCoupon = (coupon: CouponFromSupabase) => {
    setEditingCoupon(coupon);
    
    form.reset({
      code: coupon.code,
      discount_amount: coupon.discount_amount,
      is_percentage: coupon.is_percentage,
      start_date: parseISO(coupon.start_date),
      expiry_date: parseISO(coupon.expiry_date),
      usage_limit: coupon.usage_limit,
      success_message: coupon.success_message || "Coupon applied successfully!",
      active: coupon.active,
    });
    
    setIsAddCouponOpen(true);
  };

  // Form submission handler
  const onSubmit = (values: CouponFormValues) => {
    couponMutation.mutate(values);
  };

  const handleDelete = (couponId: string) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      deleteCouponMutation.mutate(couponId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Coupons</h2>
        <Button onClick={() => setIsAddCouponOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Coupon
        </Button>
      </div>
      
      {/* Coupons List */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Validity</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Loading coupons...
                </TableCell>
              </TableRow>
            ) : coupons && coupons.length > 0 ? (
              coupons.map((coupon: CouponFromSupabase) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-medium">{coupon.code}</TableCell>
                  <TableCell>
                    {coupon.is_percentage ? (
                      <div className="flex items-center">
                        {coupon.discount_amount}%
                        <Percent className="ml-1 h-4 w-4 text-gray-500" />
                      </div>
                    ) : (
                      <div className="flex items-center">
                        ₹{coupon.discount_amount.toFixed(2)}
                        <Badge className="ml-1 h-4 w-4 text-gray-500" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">
                        From: {format(parseISO(coupon.start_date), 'PP')}
                      </span>
                      <span className="text-xs text-gray-500">
                        To: {format(parseISO(coupon.expiry_date), 'PP')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {coupon.usage_limit ? (
                      <span>{coupon.usage_count} / {coupon.usage_limit}</span>
                    ) : (
                      <span>{coupon.usage_count} / ∞</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {coupon.active ? (
                      <BadgeComponent variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Active
                      </BadgeComponent>
                    ) : (
                      <BadgeComponent variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                        Inactive
                      </BadgeComponent>
                    )}
                    {new Date() > parseISO(coupon.expiry_date) && (
                      <BadgeComponent variant="outline" className="ml-2 bg-red-50 text-red-700 border-red-200">
                        Expired
                      </BadgeComponent>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleEditCoupon(coupon)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="text-red-500" 
                        onClick={() => handleDelete(coupon.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No coupons found. Add your first coupon!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Add/Edit Coupon Dialog */}
      <Dialog open={isAddCouponOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Coupon Code */}
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coupon Code</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., SUMMER2023" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormDescription>
                      Customers will enter this code to apply the discount.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Discount Type */}
              <FormField
                control={form.control}
                name="is_percentage"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Discount Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => field.onChange(value === "percentage")}
                        defaultValue={field.value ? "percentage" : "fixed"}
                        value={field.value ? "percentage" : "fixed"}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="percentage" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            Percentage (%)
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="fixed" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            Fixed Amount (₹)
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Discount Amount */}
              <FormField
                control={form.control}
                name="discount_amount"
                render={({ field }) => {
                  const isPercentage = form.watch("is_percentage");
                  return (
                    <FormItem>
                      <FormLabel>Discount Amount</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="number" 
                            placeholder={isPercentage ? "e.g., 10" : "e.g., 100"} 
                            {...field}
                            min={1}
                            max={isPercentage ? 100 : undefined}
                            className="pl-8"
                          />
                          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
                            {isPercentage ? '%' : '₹'}
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        {isPercentage 
                          ? "Enter percentage value (1-100)" 
                          : "Enter fixed amount in rupees"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              
              {/* Validity Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date("2000-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="expiry_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Expiry Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date("2000-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Usage Limit */}
              <FormField
                control={form.control}
                name="usage_limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usage Limit</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Leave empty for unlimited uses" 
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? null : parseInt(value, 10));
                        }}
                        value={field.value === null ? "" : field.value}
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum number of times this coupon can be used. Leave empty for unlimited uses.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Success Message */}
              <FormField
                control={form.control}
                name="success_message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Success Message</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Custom message to display when coupon is applied successfully" 
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      This message will be shown to customers when they successfully apply the coupon.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Active Status */}
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Active
                      </FormLabel>
                      <FormDescription>
                        Toggle whether this coupon is currently active.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCloseForm}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={couponMutation.isPending}
                >
                  {couponMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingCoupon ? 'Update' : 'Add'} Coupon
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CouponsManagement;
