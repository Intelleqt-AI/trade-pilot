import { useQueryClient } from '@tanstack/react-query';
import useFetch from './useFetch';
import { usePost } from './usePost';
import { apiRequest } from '@/lib/apiClient';

const ME_URL = '/api/v1/tradepilot/auth/me/';

export interface TradePilotUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  platform: string;
  user_type: 'customer' | 'trade' | '';
  is_active: boolean;
  email_verified: boolean;
  credit_balance: number | null;
  // TradePilotProfile fields
  phone: string;
  business_name: string;
  business_type: string;
  years_experience: string;
  trade_specialty: string;
  postcode: string;
  has_insurance: boolean;
  has_license: boolean;
  profile_description: string;
}

interface MeResponse {
  data: TradePilotUser;
}

export const useAuth = () => {
  const queryClient = useQueryClient();

  const { data: meData, isLoading } = useFetch<MeResponse | null>(ME_URL, {
    queryFn: async () => {
      try {
        return await apiRequest<MeResponse>(ME_URL, { method: 'GET' }, true);
      } catch (err: any) {
        if (err?.response?.status === 401) return null;
        throw err;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const user = meData?.data ?? null;

  const loginMutation = usePost<any>({});

  const signIn = async (email: string, password: string) => {
    const res = await loginMutation.mutateAsync({
      url: '/api/v1/tradepilot/auth/login/',
      data: { email, password },
    } as any);
    // Seed cache immediately so TradeCRMLayout sees authenticated user on navigate
    if (res?.data?.user) {
      queryClient.setQueryData([ME_URL], { data: res.data.user });
    }
    return res;
  };

  const signOut = async () => {
    try {
      await apiRequest('/api/v1/tradepilot/auth/logout/', { method: 'POST' }, true);
    } catch {
      // ignore — cookies cleared server-side regardless
    } finally {
      queryClient.clear();
    }
  };

  return {
    user,
    profile: user,
    loading: isLoading,
    signIn,
    signOut,
    isAuthenticated: !!user,
    isCustomer: user?.user_type === 'customer',
    isTrade: user?.user_type === 'trade',
  };
};
