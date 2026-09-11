import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Session } from '@supabase/supabase-js';
import axios from 'axios';
import { User, UserRole, CandidateProfile } from '../types';
import { apiService } from '../services/api';
import { supabase } from '../services/supabase';
import { DEMO_ACCOUNTS } from '../config/demoAccounts';

export type AuthState = 'initializing' | 'authenticated' | 'unauthenticated' | 'error';

interface AuthContextType {
  user: User | null;
  profile: CandidateProfile | null;
  role: UserRole | null;
  status: AuthState;
  isLoading: boolean;
  demoSwitchRole: (role: UserRole) => Promise<void>;
  updateUserRole: (role: UserRole) => Promise<void>;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [sessionChecked, setSessionChecked] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    // 1. Restore session on mount
    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setSession(data.session ?? null);
        setSessionChecked(true);
      }
    });

    // 2. Subscribe to auth changes across tabs
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (isMounted) {
        setSession(newSession ?? null);
        setSessionChecked(true);
        if (_event === 'SIGNED_OUT') {
          queryClient.removeQueries({ queryKey: ['authMe'] });
        } else if (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED') {
          queryClient.invalidateQueries({ queryKey: ['authMe'] });
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [queryClient]);

  // 3. Singleton /auth/me TanStack Query (Single source of identity)
  const authMeQuery = useQuery({
    queryKey: ['authMe', session?.user?.id || 'no-user'],
    queryFn: () => apiService.getAuthMe(),
    enabled: Boolean(sessionChecked && session?.access_token),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (axios.isAxiosError(error)) {
        const httpStatus = error.response?.status;
        if (httpStatus === 401 || httpStatus === 403) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });

  // 4. Deterministic auth state machine
  let status: AuthState = 'initializing';
  if (!sessionChecked) {
    status = 'initializing';
  } else if (!session?.access_token) {
    status = 'unauthenticated';
  } else if (authMeQuery.isPending || authMeQuery.isFetching) {
    status = 'initializing';
  } else if (authMeQuery.isSuccess && authMeQuery.data?.user) {
    status = 'authenticated';
  } else if (authMeQuery.isError) {
    const is401 =
      axios.isAxiosError(authMeQuery.error) && authMeQuery.error.response?.status === 401;
    status = is401 ? 'unauthenticated' : 'error';
  }

  // Identity is populated EXCLUSIVELY from backend /auth/me response
  const user = status === 'authenticated' ? (authMeQuery.data?.user ?? null) : null;
  const profile = status === 'authenticated' ? (authMeQuery.data?.profile ?? null) : null;
  const role = user?.role ?? null;
  const isLoading = status === 'initializing';

  const demoSwitchRole = async (targetRole: UserRole) => {
    const account = DEMO_ACCOUNTS[targetRole];
    if (!account) {
      throw new Error(`Unknown demo role: ${targetRole}`);
    }
    await supabase.auth.signOut();
    const { error } = await supabase.auth.signInWithPassword({
      email: account.email,
      password: account.password,
    });
    if (error) {
      throw new Error(`Failed to sign in to demo account ${targetRole}: ${error.message}`);
    }
    await queryClient.invalidateQueries({ queryKey: ['authMe'] });
  };

  const updateUserRole = async (targetRole: UserRole) => {
    await apiService.updateUserRole(targetRole);
    await queryClient.invalidateQueries({ queryKey: ['authMe'] });
  };

  const refreshProfile = async () => {
    await queryClient.invalidateQueries({ queryKey: ['authMe'] });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    queryClient.removeQueries({ queryKey: ['authMe'] });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        status,
        isLoading,
        demoSwitchRole,
        updateUserRole,
        refreshProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
