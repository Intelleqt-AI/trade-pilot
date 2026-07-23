import { useQuery } from '@tanstack/react-query';
import { fetchData } from '@/lib/api';

export interface CreditProduct {
  price_id: string;
  product_id: string;
  name: string;
  description: string;
  credits: number;
  unit_amount: number; // minor units (e.g. pence)
  currency: string; // ISO 4217, lowercase (e.g. 'gbp')
  images: string[];
  metadata?: Record<string, string>;
}

export const CREDIT_PRODUCTS_KEY = ['credit-products'] as const;

/** Dynamic credit packages sourced from Stripe products (via the backend). */
export function useCreditProducts() {
  return useQuery<CreditProduct[]>({
    queryKey: CREDIT_PRODUCTS_KEY,
    // Endpoint returns a bare array; normalize the {data:[...]} envelope defensively.
    queryFn: () =>
      fetchData<any>('/api/v1/payments/products/').then((r) => (r?.data ?? r) as CreditProduct[]),
    staleTime: 5 * 60 * 1000, // catalog rarely changes — minimize Stripe-backed calls
  });
}
