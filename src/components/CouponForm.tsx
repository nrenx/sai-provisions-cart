
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CouponFromSupabase } from '@/types/supabase';

interface CouponFormProps {
  onApplyCoupon: (discountAmount: number, isPercentage: boolean, couponCode: string) => void;
  onRemoveCoupon: () => void;
  appliedCoupon: {
    code: string;
    discountAmount: number;
    isPercentage: boolean;
  } | null;
}

const CouponForm: React.FC<CouponFormProps> = ({
  onApplyCoupon,
  onRemoveCoupon,
  appliedCoupon
}) => {
  const [couponCode, setCouponCode] = useState<string>('');

  const validateCouponMutation = useMutation({
    mutationFn: async (code: string) => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('active', true)
        .single();

      if (error) throw error;
      
      const now = new Date().toISOString();
      
      // Check if coupon is valid in terms of date range
      if (now < data.start_date || now > data.expiry_date) {
        throw new Error('Coupon has expired or is not active yet.');
      }
      
      // Check usage limit
      if (data.usage_limit !== null && data.usage_count >= data.usage_limit) {
        throw new Error('Coupon usage limit has been reached.');
      }
      
      return data as CouponFromSupabase;
    },
    onSuccess: (data) => {
      // Show success message
      toast.success(data.success_message || 'Coupon applied successfully!');
      
      // Apply the coupon discount
      onApplyCoupon(data.discount_amount, data.is_percentage, data.code);
      
      // Clear the input field
      setCouponCode('');
      
      // Update usage count
      updateCouponUsage(data.id);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Invalid coupon code. Please try again.');
    }
  });

  // Increment the usage count for the coupon
  const updateCouponUsage = async (couponId: string) => {
    try {
      // Get current usage count
      const { data: currentData } = await supabase
        .from('coupons')
        .select('usage_count')
        .eq('id', couponId)
        .single();

      // Increment usage count
      if (currentData) {
        await supabase
          .from('coupons')
          .update({ 
            usage_count: (currentData.usage_count as number) + 1,
            updated_at: new Date().toISOString() 
          })
          .eq('id', couponId);
      }
    } catch (error) {
      console.error('Error updating coupon usage:', error);
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim()) {
      validateCouponMutation.mutate(couponCode);
    }
  };

  const handleRemoveCoupon = () => {
    onRemoveCoupon();
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        {!appliedCoupon ? (
          <form onSubmit={handleApplyCoupon} className="flex flex-wrap items-center gap-2">
            <div className="flex-grow">
              <Input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="w-full"
              />
            </div>
            <Button
              type="submit"
              disabled={!couponCode.trim() || validateCouponMutation.isPending}
              className="whitespace-nowrap"
            >
              {validateCouponMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Apply Coupon
            </Button>
          </form>
        ) : (
          <div className="flex items-center justify-between bg-green-50 p-3 rounded-md">
            <div className="flex flex-col">
              <div className="font-medium text-green-700">
                Coupon applied: <span className="font-bold">{appliedCoupon.code}</span>
              </div>
              <div className="text-sm text-green-600">
                {appliedCoupon.isPercentage
                  ? `${appliedCoupon.discountAmount}% off your order`
                  : `₹${appliedCoupon.discountAmount} off your order`}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveCoupon}
              className="text-green-700 hover:text-red-700 hover:bg-red-50"
            >
              Remove
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CouponForm;
