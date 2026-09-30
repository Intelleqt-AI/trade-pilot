import { useQueryClient } from '@tanstack/react-query';
import useFetch from './useFetch';
import { apiRequest, BASE_URL } from '@/lib/apiClient';
import type { SignupAs } from '@/lib/socialAuth';

export const ME_URL = '/api/v1/tradepilot/auth/me/';

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
  address: string;
  latitude: number | null;
  longitude: number | null;
  radius_km: number;
  has_insurance: boolean;
  has_license: boolean;
  is_verified: boolean;
  profile_description: string;
  profile_photo_url: string | null;
  /** False for accounts that only sign in with Google/Apple. */
  has_password?: boolean;
  auth_providers?: string[];
  /** Homeowner onboarding wizard — traders never see it. */
  onboarding_completed?: boolean;
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
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const user = meData?.data ?? null;

  /** Write a freshly-authenticated user into the cache.
   *
   *  `/me/` is cached with a 30-minute staleTime, so an anonymous visit caches a
   *  `null` that outlives signing in. Every authenticating path must seed the
   *  cache or the app keeps believing the user is logged out. */
  const setAuthUser = (nextUser: TradePilotUser) => {
    queryClient.setQueryData([ME_URL], { data: nextUser });
  };

  // Auth endpoints answer bad credentials with 401 — skip apiRequest's "session expired,
  // redirect to /login" handling so the caller gets the error body instead.
  const postAuth = async (url: string, data: unknown) => {
    const res = await apiRequest<any>(url, { method: 'POST', body: JSON.stringify(data) }, true);
    // Seed cache immediately so TradeCRMLayout sees authenticated user on navigate
    if (res?.data?.user) {
      setAuthUser(res.data.user);
    }
    return res;
  };

  const signIn = (email: string, password: string, role?: 'trade' | 'customer') =>
    postAuth('/api/v1/tradepilot/auth/login/', { email, password, role });

  const signInWithGoogle = (credential: string, signupAs?: SignupAs) =>
    postAuth('/api/v1/tradepilot/auth/social/google/', { credential, signup_as: signupAs });

  const signInWithApple = (idToken: string, firstName?: string, lastName?: string, signupAs?: SignupAs) =>
    postAuth('/api/v1/tradepilot/auth/social/apple/', {
      id_token: idToken,
      first_name: firstName,
      last_name: lastName,
      signup_as: signupAs,
    });

  const registerTradeWithSocial = (payload: Record<string, unknown>) =>
    postAuth('/api/v1/tradepilot/auth/trade/register/social/', payload);

  /** Confirm the signup OTP. The endpoint sets the auth cookies, so going through
   *  postAuth leaves the user signed in — reaching the dashboard without a second
   *  login. Used by both the homeowner and trader signup flows. */
  const verifyEmail = (pendingToken: string, otp: string) =>
    postAuth('/api/v1/tradepilot/auth/verify-email/', { pending_token: pendingToken, otp });

  const signOut = async () => {
    try {
      await fetch(`${BASE_URL}/api/v1/tradepilot/auth/logout/`, {
        method: 'POST',
        credentials: 'include',
      });
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
    signInWithGoogle,
    signInWithApple,
    registerTradeWithSocial,
    verifyEmail,
    setAuthUser,
    signOut,
    isAuthenticated: !!user,
    isCustomer: user?.user_type === 'customer',
    isTrade: user?.user_type === 'trade',
  };
};
