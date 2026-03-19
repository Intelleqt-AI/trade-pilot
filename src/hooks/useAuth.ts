import { useState, useEffect } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole, UserProfile } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { isDemoMode, DEMO_CREDENTIALS, mockProfiles } from '@/lib/mockData';

// Demo user objects
const DEMO_USERS = {
  customer: {
    id: 'demo-customer-user-id',
    email: DEMO_CREDENTIALS.customer.email,
    app_metadata: {},
    user_metadata: { role: 'customer' },
    aud: 'authenticated',
    created_at: '2024-01-15T10:00:00Z',
  } as unknown as User,
  trade: {
    id: 'demo-trade-user-id',
    email: DEMO_CREDENTIALS.trade.email,
    app_metadata: {},
    user_metadata: { role: 'trade' },
    aud: 'authenticated',
    created_at: '2024-01-10T09:00:00Z',
  } as unknown as User,
};

const DEMO_STORAGE_KEY = 'demo_auth_user';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isDemoMode()) {
      // Check for existing demo session
      const storedUser = localStorage.getItem(DEMO_STORAGE_KEY);
      if (storedUser) {
        const userType = storedUser as 'customer' | 'trade';
        setUser(DEMO_USERS[userType]);
        const profileId = userType === 'customer' ? 'demo-customer-id' : 'demo-trade-id';
        setProfile(mockProfiles[profileId]);
      }
      setLoading(false);
      return;
    }

    // Real Supabase auth flow
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user!.id);
        }, 0);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();

      if (error) throw error;

      if (!data) {
        const { data: userResp } = await supabase.auth.getUser();
        const email = userResp.user?.email ?? null;

        const { error: insertError } = await supabase.from('profiles').insert({
          user_id: userId,
          email,
          first_name: '',
          last_name: '',
          role: 'customer',
        });

        if (insertError) throw insertError;

        const { data: created } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();

        setProfile(created as UserProfile);
      } else {
        setProfile(data as UserProfile);
      }
    } catch (error) {
      console.error('Error fetching/creating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userData: {
      firstName: string;
      lastName: string;
      role: UserRole;
    }
  ) => {
    if (isDemoMode()) {
      toast({
        title: 'Demo Mode',
        description: 'Sign up is disabled in demo mode. Please use the demo login credentials.',
      });
      return { data: null, error: null };
    }

    try {
      setLoading(true);

      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            ...userData,
          },
        },
      });

      if (error) throw error;

      toast({
        title: 'Account created successfully',
        description: 'Please check your email to verify your account.',
      });

      return { data, error: null };
    } catch (error) {
      const authError = error as AuthError;
      toast({
        title: 'Sign up failed',
        description: authError.message,
        variant: 'destructive',
      });
      return { data: null, error: authError };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (isDemoMode()) {
      setLoading(true);

      // Check demo credentials
      if (email === DEMO_CREDENTIALS.customer.email && password === DEMO_CREDENTIALS.customer.password) {
        localStorage.setItem(DEMO_STORAGE_KEY, 'customer');
        setUser(DEMO_USERS.customer);
        setProfile(mockProfiles['demo-customer-id']);
        toast({
          title: 'Demo Login Successful',
          description: 'Welcome! You are logged in as a customer.',
        });
        setLoading(false);
        return { data: { user: DEMO_USERS.customer }, error: null };
      }

      if (email === DEMO_CREDENTIALS.trade.email && password === DEMO_CREDENTIALS.trade.password) {
        localStorage.setItem(DEMO_STORAGE_KEY, 'trade');
        setUser(DEMO_USERS.trade);
        setProfile(mockProfiles['demo-trade-id']);
        toast({
          title: 'Demo Login Successful',
          description: 'Welcome! You are logged in as a trade professional.',
        });
        setLoading(false);
        return { data: { user: DEMO_USERS.trade }, error: null };
      }

      // Invalid demo credentials
      toast({
        title: 'Invalid Demo Credentials',
        description: `Use customer@demo.com or trade@demo.com with password: demo123`,
        variant: 'destructive',
      });
      setLoading(false);
      return { data: null, error: { message: 'Invalid demo credentials' } as AuthError };
    }

    // Real Supabase auth
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: 'Signed in successfully',
        description: 'Welcome back!',
      });

      return { data, error: null };
    } catch (error) {
      const authError = error as AuthError;
      toast({
        title: 'Sign in failed',
        description: authError.message,
        variant: 'destructive',
      });
      return { data: null, error: authError };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (isDemoMode()) {
      localStorage.removeItem(DEMO_STORAGE_KEY);
      setUser(null);
      setProfile(null);
      toast({
        title: 'Signed out',
        description: 'See you next time!',
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: 'Signed out successfully',
        description: 'See you next time!',
      });
    } catch (error) {
      const authError = error as AuthError;
      toast({
        title: 'Sign out failed',
        description: authError.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
    isCustomer: profile?.role === 'customer',
    isTrade: profile?.role === 'trade',
  };
};
