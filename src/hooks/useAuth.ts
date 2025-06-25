import { useSession } from 'next-auth/react';
import { useCallback } from 'react';
import { ServiceContainer } from '../services/ServiceContainer';

export const useAuth = () => {
  const { data: session, status, update } = useSession();
  const serviceContainer = ServiceContainer.getInstance();
  const authService = serviceContainer.getAuthService();

  const validateToken = useCallback(async (token: string) => {
    return await authService.validateToken(token);
  }, [authService]);

  const refreshToken = useCallback(async (refreshToken: string) => {
    return await authService.refreshToken(refreshToken);
  }, [authService]);

  const getUserProfile = useCallback(async (userId: string) => {
    return await authService.getUserProfile(userId);
  }, [authService]);

  return {
    session,
    status,
    update,
    validateToken,
    refreshToken,
    getUserProfile,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
  };
}; 