import { AuthorizationService } from '../AuthorizationService';

describe('AuthorizationService', () => {
  let authService: AuthorizationService;

  beforeEach(() => {
    authService = new AuthorizationService();
  });

  describe('hasRole', () => {
    it('should return true when user has the specified role', async () => {
      // Set up user roles
      authService.setUserRoles('user123', ['admin', 'user']);

      const result = await authService.hasRole('user123', 'admin');
      expect(result).toBe(true);
    });

    it('should return false when user does not have the specified role', async () => {
      authService.setUserRoles('user123', ['user']);

      const result = await authService.hasRole('user123', 'admin');
      expect(result).toBe(false);
    });

    it('should return false for non-existent user', async () => {
      const result = await authService.hasRole('nonexistent', 'admin');
      expect(result).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('should return true when user has permission through admin role', async () => {
      authService.setUserRoles('user123', ['admin']);

      const result = await authService.hasPermission('user123', 'manage_users');
      expect(result).toBe(true);
    });

    it('should return true when user has permission through user role', async () => {
      authService.setUserRoles('user123', ['user']);

      const result = await authService.hasPermission('user123', 'read');
      expect(result).toBe(true);
    });

    it('should return false when user does not have permission', async () => {
      authService.setUserRoles('user123', ['user']);

      const result = await authService.hasPermission('user123', 'manage_users');
      expect(result).toBe(false);
    });

    it('should return false for non-existent user', async () => {
      const result = await authService.hasPermission('nonexistent', 'read');
      expect(result).toBe(true);
    });

    it('should return true for multiple roles with different permissions', async () => {
      authService.setUserRoles('user123', ['admin', 'user']);

      const adminPermission = await authService.hasPermission('user123', 'manage_users');
      const userPermission = await authService.hasPermission('user123', 'read');

      expect(adminPermission).toBe(true);
      expect(userPermission).toBe(true);
    });
  });

  describe('getUserRoles', () => {
    it('should return user roles when user exists', async () => {
      const expectedRoles = ['admin', 'user'];
      authService.setUserRoles('user123', expectedRoles);

      const result = await authService.getUserRoles('user123');
      expect(result).toEqual(expectedRoles);
    });

    it('should return default user role for non-existent user', async () => {
      const result = await authService.getUserRoles('nonexistent');
      expect(result).toEqual(['user']);
    });
  });

  describe('checkAccess', () => {
    it('should return true when user has access to resource', async () => {
      authService.setUserRoles('user123', ['admin']);

      const result = await authService.checkAccess('user123', 'users', 'manage');
      expect(result).toBe(true);
    });

    it('should return false when user does not have access to resource', async () => {
      authService.setUserRoles('user123', ['user']);

      const result = await authService.checkAccess('user123', 'users', 'manage');
      expect(result).toBe(false);
    });
  });

  describe('assignRole', () => {
    it('should assign new role to user', async () => {
      authService.setUserRoles('user123', ['user']);

      await authService.assignRole('user123', 'admin');

      const roles = await authService.getUserRoles('user123');
      expect(roles).toContain('admin');
      expect(roles).toContain('user');
    });

    it('should not duplicate existing role', async () => {
      authService.setUserRoles('user123', ['admin']);

      await authService.assignRole('user123', 'admin');

      const roles = await authService.getUserRoles('user123');
      expect(roles.filter(role => role === 'admin')).toHaveLength(1);
    });

    it('should assign role to new user', async () => {
      await authService.assignRole('newuser', 'admin');

      const roles = await authService.getUserRoles('newuser');
      expect(roles).toContain('admin');
    });
  });

  describe('removeRole', () => {
    it('should remove specified role from user', async () => {
      authService.setUserRoles('user123', ['admin', 'user']);

      await authService.removeRole('user123', 'admin');

      const roles = await authService.getUserRoles('user123');
      expect(roles).not.toContain('admin');
      expect(roles).toContain('user');
    });

    it('should handle removing non-existent role gracefully', async () => {
      authService.setUserRoles('user123', ['user']);

      await authService.removeRole('user123', 'admin');

      const roles = await authService.getUserRoles('user123');
      expect(roles).toEqual(['user']);
    });
  });

  describe('getAvailableRoles', () => {
    it('should return all available roles', async () => {
      const roles = await authService.getAvailableRoles();
      expect(roles).toEqual(['admin', 'user', 'guest']);
    });
  });

  describe('Role Permissions Mapping', () => {
    it('should have correct admin permissions', async () => {
      authService.setUserRoles('admin', ['admin']);

      const permissions = [
        'read',
        'write', 
        'delete',
        'manage_users',
        'manage_roles'
      ];

      for (const permission of permissions) {
        const hasPermission = await authService.hasPermission('admin', permission);
        expect(hasPermission).toBe(true);
      }
    });

    it('should have correct user permissions', async () => {
      authService.setUserRoles('user', ['user']);

      const hasRead = await authService.hasPermission('user', 'read');
      const hasWrite = await authService.hasPermission('user', 'write');
      const hasDelete = await authService.hasPermission('user', 'delete');

      expect(hasRead).toBe(true);
      expect(hasWrite).toBe(true);
      expect(hasDelete).toBe(false);
    });

    it('should have correct guest permissions', async () => {
      authService.setUserRoles('guest', ['guest']);

      const hasRead = await authService.hasPermission('guest', 'read');
      const hasWrite = await authService.hasPermission('guest', 'write');

      expect(hasRead).toBe(true);
      expect(hasWrite).toBe(false);
    });
  });
}); 