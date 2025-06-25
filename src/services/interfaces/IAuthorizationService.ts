export interface IAuthorizationService {
  hasRole(userId: string, role: string): Promise<boolean>;
  hasPermission(userId: string, permission: string): Promise<boolean>;
  getUserRoles(userId: string): Promise<string[]>;
  checkAccess(userId: string, resource: string, action: string): Promise<boolean>;
}

export interface IRoleManager {
  assignRole(userId: string, role: string): Promise<void>;
  removeRole(userId: string, role: string): Promise<void>;
  getAvailableRoles(): Promise<string[]>;
} 