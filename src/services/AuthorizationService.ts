import { IAuthorizationService, IRoleManager } from './interfaces/IAuthorizationService';

export class AuthorizationService implements IAuthorizationService, IRoleManager {
  private readonly rolePermissions: Map<string, string[]> = new Map([
    ['admin', ['read', 'write', 'delete', 'manage_users', 'manage_roles']],
    ['user', ['read', 'write']],
    ['guest', ['read']]
  ]);

  private readonly userRoles: Map<string, string[]> = new Map();

  async hasRole(userId: string, role: string): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    return userRoles.includes(role);
  }

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    
    for (const role of userRoles) {
      const permissions = this.rolePermissions.get(role) || [];
      if (permissions.includes(permission)) {
        return true;
      }
    }
    
    return false;
  }

  async getUserRoles(userId: string): Promise<string[]> {
    // In a real application, this would fetch from database
    // For now, we'll use in-memory storage
    return this.userRoles.get(userId) || ['user'];
  }

  async checkAccess(userId: string, resource: string, action: string): Promise<boolean> {
    const permission = `${action}_${resource}`;
    return await this.hasPermission(userId, permission);
  }

  async assignRole(userId: string, role: string): Promise<void> {
    const currentRoles = await this.getUserRoles(userId);
    if (!currentRoles.includes(role)) {
      currentRoles.push(role);
      this.userRoles.set(userId, currentRoles);
    }
  }

  async removeRole(userId: string, role: string): Promise<void> {
    const currentRoles = await this.getUserRoles(userId);
    const updatedRoles = currentRoles.filter(r => r !== role);
    this.userRoles.set(userId, updatedRoles);
  }

  async getAvailableRoles(): Promise<string[]> {
    return Array.from(this.rolePermissions.keys());
  }

  // Helper method to set user roles (for testing/demo purposes)
  setUserRoles(userId: string, roles: string[]): void {
    this.userRoles.set(userId, roles);
  }
} 