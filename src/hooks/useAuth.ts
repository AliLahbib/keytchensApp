/**
 * useAuth Hook - Custom hook for authentication state management
 * @file Provides React hook interface to authentication service
 * Encapsulates auth logic for component consumption
 */

import { useCallback, useEffect, useState } from 'react';
import { AuthService } from '../services/AuthService';
import { AuthState, User, AuthError } from '../types/auth.types';

interface UseAuthReturn extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

/**
 * Custom hook for managing authentication state
 * @param authService - Auth service instance
 * @returns Auth state and methods
 */
export const useAuth = (authService: AuthService): UseAuthReturn => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
    isAuthenticated: false,
  });

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const isAuth = await authService.isAuthenticated();
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: isAuth,
          isLoading: false,
        }));
      } catch {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
        }));
      }
    };

    initializeAuth();
  }, [authService]);

  /**
   * Login handler
   */
  const login = useCallback(
    async (email: string, password: string) => {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await authService.login({ email, password });
        setAuthState({
          user: response.user,
          isLoading: false,
          error: null,
          isAuthenticated: true,
        });
      } catch (err) {
        const error = err as AuthError;
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error,
        }));
        throw error;
      }
    },
    [authService],
  );

  /**
   * Logout handler
   */
  const logout = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      await authService.logout();
      setAuthState({
        user: null,
        isLoading: false,
        error: null,
        isAuthenticated: false,
      });
    } catch (err) {
      const error = err as AuthError;
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error,
      }));
      throw error;
    }
  }, [authService]);

  return {
    ...authState,
    login,
    logout,
    isLoading: authState.isLoading,
  };
};
