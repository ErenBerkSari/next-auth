import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ServiceContainer } from './src/services/ServiceContainer';

export async function middleware(request: NextRequest) {
  const serviceContainer = ServiceContainer.getInstance();
  const middlewareService = serviceContainer.getMiddlewareService();
  
  // Use the service layer to protect routes
  const response = await middlewareService.protectRoute(request);
  
  if (response) {
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile', '/admin'],
};
