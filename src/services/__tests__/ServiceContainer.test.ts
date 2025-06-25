/**
 * @jest-environment node
 */
import { ServiceContainer } from '../ServiceContainer';

describe('ServiceContainer', () => {
  it('should get singleton instance', () => {
    const instance1 = ServiceContainer.getInstance();
    const instance2 = ServiceContainer.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should get auth service', () => {
    const container = ServiceContainer.getInstance();
    const authService = container.getAuthService();
    expect(authService).toBeDefined();
  });

  it('should get authorization service', () => {
    const container = ServiceContainer.getInstance();
    const authService = container.getAuthorizationService();
    expect(authService).toBeDefined();
  });

  it('should get role manager', () => {
    const container = ServiceContainer.getInstance();
    const roleManager = container.getRoleManager();
    expect(roleManager).toBeDefined();
  });

  it('should get middleware service', () => {
    const container = ServiceContainer.getInstance();
    const middlewareService = container.getMiddlewareService();
    expect(middlewareService).toBeDefined();
  });
}); 