import { useSession } from 'next-auth/react';
import { useCallback, useMemo } from 'react';
import { ServiceContainer } from '../services/ServiceContainer';

export const useAuthorization = () => {
  const { data: session } = useSession();
  const serviceContainer = ServiceContainer.getInstance();
  const authService = serviceContainer.getAuthorizationService();
  const roleManager = serviceContainer.getRoleManager();

  const userId = session?.user?.id;

  const hasRole = useCallback(async (role: string) => {
    if (!userId) return false;
    return await authService.hasRole(userId, role);
  }, [authService, userId]);

  const hasPermission = useCallback(async (permission: string) => {
    if (!userId) return false;
    return await authService.hasPermission(userId, permission);
  }, [authService, userId]);

  const getUserRoles = useCallback(async () => {
    if (!userId) return [];
    return await authService.getUserRoles(userId);
  }, [authService, userId]);

  const checkAccess = useCallback(async (resource: string, action: string) => {
    if (!userId) return false;
    return await authService.checkAccess(userId, resource, action);
  }, [authService, userId]);

  const assignRole = useCallback(async (role: string) => {
    if (!userId) return;
    await roleManager.assignRole(userId, role);
  }, [roleManager, userId]);

  const removeRole = useCallback(async (role: string) => {
    if (!userId) return;
    await roleManager.removeRole(userId, role);
  }, [roleManager, userId]);

  const getAvailableRoles = useCallback(async () => {
    return await roleManager.getAvailableRoles();
  }, [roleManager]);

  // Memoized values for better performance
  const userRoles = useMemo(() => {
    if (!session?.user?.role) return [];
    return Array.isArray(session.user.role) ? session.user.role : [session.user.role];
  }, [session?.user?.role]);

  const isAdmin = useMemo(() => {
    return userRoles.includes('admin');
  }, [userRoles]);

  const isUser = useMemo(() => {
    return userRoles.includes('user') || userRoles.includes('admin');
  }, [userRoles]);

  return {
    hasRole,
    hasPermission,
    getUserRoles,
    checkAccess,
    assignRole,
    removeRole,
    getAvailableRoles,
    userRoles,
    isAdmin,
    isUser,
    userId,
  };
}; 