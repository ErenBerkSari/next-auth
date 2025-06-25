import { NextRequest, NextResponse } from 'next/server';

export interface IMiddlewareService {
  protectRoute(request: NextRequest, allowedRoles?: string[]): Promise<NextResponse | null>;
  validateRequest(request: NextRequest): Promise<boolean>;
  getProtectedPaths(): string[];
  addProtectedPath(path: string): void;
  removeProtectedPath(path: string): void;
}

export interface IRouteGuard {
  canAccess(userId: string, path: string): Promise<boolean>;
  getRequiredRoles(path: string): string[];
} 