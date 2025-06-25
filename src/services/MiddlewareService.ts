import { NextRequest, NextResponse } from 'next/server';
import { IMiddlewareService, IRouteGuard } from './interfaces/IMiddlewareService';
import { getToken } from 'next-auth/jwt';

export class MiddlewareService implements IMiddlewareService, IRouteGuard {
  private protectedPaths: string[] = ['/profile', '/admin'];
  private readonly routeRoles: Map<string, string[]> = new Map([
    ['/admin', ['admin']],
    ['/profile', ['user', 'admin']]
  ]);

  async protectRoute(request: NextRequest, allowedRoles?: string[]): Promise<NextResponse | null> {
    try {
      const { pathname } = request.nextUrl;
      
      if (!this.isProtectedPath(pathname)) {
        return null; // Not a protected path, allow access
      }
  
      const token = await getToken({ 
        req: request, 
        secret: process.env.AUTH0_SECRET 
      });
  
      if (!token) {
        const loginUrl = new URL('/api/auth/signin?callbackUrl=' + encodeURIComponent(request.url), request.url);
        return NextResponse.redirect(loginUrl);
      }
  
      // Check role-based access if roles are specified
      if (allowedRoles && token.role) {
        const userRoles = Array.isArray(token.role) ? token.role : [token.role];
        const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role));
        
        if (!hasRequiredRole) {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
      }
  
      return null; // Allow access
    } catch (err) {
      // Hata durumunda signin'e yönlendir
      const loginUrl = new URL('/api/auth/signin?callbackUrl=' + encodeURIComponent(request.url), request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  async validateRequest(request: NextRequest): Promise<boolean> {
    try {
      const token = await getToken({ 
        req: request, 
        secret: process.env.AUTH0_SECRET 
      });
      return !!token;
    } catch (err) {
      return false;
    }
  }

  getProtectedPaths(): string[] {
    return [...this.protectedPaths];
  }

  addProtectedPath(path: string): void {
    if (!this.protectedPaths.includes(path)) {
      this.protectedPaths.push(path);
    }
  }

  removeProtectedPath(path: string): void {
    this.protectedPaths = this.protectedPaths.filter(p => p !== path);
  }

  async canAccess(userId: string, path: string): Promise<boolean> {
    const requiredRoles = this.getRequiredRoles(path);
    if (requiredRoles.length === 0) {
      return true; // No role requirements
    }

    // In a real application, you would check user roles from database
    // For now, we'll assume all authenticated users have 'user' role
    return requiredRoles.includes('user') || requiredRoles.includes('admin');
  }

  getRequiredRoles(path: string): string[] {
    return this.routeRoles.get(path) || [];
  }

  private isProtectedPath(pathname: string): boolean {
    return this.protectedPaths.some(path => pathname.startsWith(path));
  }

  // Method to add role requirements for routes
  setRouteRoles(path: string, roles: string[]): void {
    this.routeRoles.set(path, roles);
  }
} 