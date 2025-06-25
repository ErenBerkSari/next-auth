import { IAuthService } from './interfaces/IAuthService';
import { IAuthorizationService, IRoleManager } from './interfaces/IAuthorizationService';
import { IMiddlewareService, IRouteGuard } from './interfaces/IMiddlewareService';
import { ILoggerService, IErrorHandler } from './interfaces/ILoggerService';
import { Auth0AuthService } from './Auth0AuthService';
import { AuthorizationService } from './AuthorizationService';
import { MiddlewareService } from './MiddlewareService';
import { LoggerService } from './LoggerService';

export class ServiceContainer {
  private static instance: ServiceContainer;
  private services: Map<string, any> = new Map();

  private constructor() {
    this.initializeServices();
  }

  public static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  private initializeServices(): void {
    // Initialize services with dependencies
    const authService = new Auth0AuthService();
    const authorizationService = new AuthorizationService();
    const middlewareService = new MiddlewareService();
    const loggerService = new LoggerService();

    // Register services
    this.services.set('IAuthService', authService);
    this.services.set('IAuthorizationService', authorizationService);
    this.services.set('IRoleManager', authorizationService);
    this.services.set('IMiddlewareService', middlewareService);
    this.services.set('IRouteGuard', middlewareService);
    this.services.set('ILoggerService', loggerService);
    this.services.set('IErrorHandler', loggerService);
  }

  public get<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }
    return service as T;
  }

  public register<T>(serviceName: string, implementation: T): void {
    this.services.set(serviceName, implementation);
  }

  // Convenience methods for getting specific services
  public getAuthService(): IAuthService {
    return this.get<IAuthService>('IAuthService');
  }

  public getAuthorizationService(): IAuthorizationService {
    return this.get<IAuthorizationService>('IAuthorizationService');
  }

  public getRoleManager(): IRoleManager {
    return this.get<IRoleManager>('IRoleManager');
  }

  public getMiddlewareService(): IMiddlewareService {
    return this.get<IMiddlewareService>('IMiddlewareService');
  }

  public getRouteGuard(): IRouteGuard {
    return this.get<IRouteGuard>('IRouteGuard');
  }

  public getLoggerService(): ILoggerService {
    return this.get<ILoggerService>('ILoggerService');
  }

  public getErrorHandler(): IErrorHandler {
    return this.get<IErrorHandler>('IErrorHandler');
  }
} 