/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { middleware } from '../../../middleware';

// Mock next-auth/jwt
jest.mock('next-auth/jwt');
const mockGetToken = getToken as jest.MockedFunction<typeof getToken>;

// Mock ServiceContainer
jest.mock('../../../src/services/ServiceContainer', () => ({
  ServiceContainer: {
    getInstance: jest.fn(() => ({
      getMiddlewareService: jest.fn(() => ({
        protectRoute: jest.fn(),
      })),
    })),
  },
}));

// Mock NextResponse
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    next: jest.fn(() => ({ status: 200 })),
    redirect: jest.fn((url: string) => ({ 
      status: 307, 
      headers: { get: jest.fn(() => url) } 
    })),
  },
}));

describe('Middleware', () => {
  let mockRequest: NextRequest;
  const mockResponse = { status: 200 };
  let mockProtectRoute: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup ServiceContainer mock
    const { ServiceContainer } = require('../../../src/services/ServiceContainer');
    mockProtectRoute = jest.fn();
    ServiceContainer.getInstance.mockReturnValue({
      getMiddlewareService: jest.fn(() => ({
        protectRoute: mockProtectRoute,
      })),
    });
    
    (NextResponse.next as jest.Mock).mockReturnValue(mockResponse);
  });

  const createMockRequest = (url: string) => {
    const request = new NextRequest(url);
    // Mock nextUrl property
    Object.defineProperty(request, 'nextUrl', {
      value: {
        pathname: new URL(url).pathname,
        search: new URL(url).search,
        searchParams: new URL(url).searchParams,
      },
      writable: true,
    });
    // url property'sini de ekle
    Object.defineProperty(request, 'url', {
      value: url,
      writable: true,
    });
    return request;
  };

  describe('Public routes', () => {
    it('should allow access to public routes without authentication', async () => {
      mockRequest = createMockRequest('http://localhost:3000');
      mockProtectRoute.mockResolvedValue(null);

      const response = await middleware(mockRequest);

      expect(response).toBe(mockResponse);
      expect(mockProtectRoute).toHaveBeenCalledWith(mockRequest);
    });

    it('should allow access to auth routes', async () => {
      mockRequest = createMockRequest('http://localhost:3000/api/auth/signin');
      mockProtectRoute.mockResolvedValue(null);

      const response = await middleware(mockRequest);

      expect(response).toBe(mockResponse);
    });

    it('should allow access to static files', async () => {
      mockRequest = createMockRequest('http://localhost:3000/favicon.ico');
      mockProtectRoute.mockResolvedValue(null);

      const response = await middleware(mockRequest);

      expect(response).toBe(mockResponse);
    });
  });

  describe('Protected routes', () => {
    it('should redirect to signin when accessing protected route without token', async () => {
      mockRequest = createMockRequest('http://localhost:3000/admin');
      const redirectResponse = { status: 307, headers: { get: jest.fn(() => '/api/auth/signin') } };
      mockProtectRoute.mockResolvedValue(redirectResponse);

      const response = await middleware(mockRequest);

      expect(response).toBe(redirectResponse);
      expect(mockProtectRoute).toHaveBeenCalledWith(mockRequest);
    });

    it('should allow access to protected route with valid token', async () => {
      mockRequest = createMockRequest('http://localhost:3000/admin');
      mockProtectRoute.mockResolvedValue(null);

      const response = await middleware(mockRequest);

      expect(response).toBe(mockResponse);
      expect(mockProtectRoute).toHaveBeenCalledWith(mockRequest);
    });

    it('should redirect non-admin users away from admin routes', async () => {
      mockRequest = createMockRequest('http://localhost:3000/admin');
      const redirectResponse = { status: 307, headers: { get: jest.fn(() => '/unauthorized') } };
      mockProtectRoute.mockResolvedValue(redirectResponse);

      const response = await middleware(mockRequest);

      expect(response).toBe(redirectResponse);
      expect(mockProtectRoute).toHaveBeenCalledWith(mockRequest);
    });

    it('should allow admin users to access admin routes', async () => {
      mockRequest = createMockRequest('http://localhost:3000/admin');
      mockProtectRoute.mockResolvedValue(null);

      const response = await middleware(mockRequest);

      expect(response).toBe(mockResponse);
      expect(mockProtectRoute).toHaveBeenCalledWith(mockRequest);
    });
  });

  describe('Profile routes', () => {
    it('should allow authenticated users to access profile', async () => {
      mockRequest = createMockRequest('http://localhost:3000/profile');
      mockProtectRoute.mockResolvedValue(null);

      const response = await middleware(mockRequest);

      expect(response).toBe(mockResponse);
      expect(mockProtectRoute).toHaveBeenCalledWith(mockRequest);
    });

    it('should redirect unauthenticated users away from profile', async () => {
      mockRequest = createMockRequest('http://localhost:3000/profile');
      const redirectResponse = { status: 307, headers: { get: jest.fn(() => '/api/auth/signin') } };
      mockProtectRoute.mockResolvedValue(redirectResponse);

      const response = await middleware(mockRequest);

      expect(response).toBe(redirectResponse);
      expect(mockProtectRoute).toHaveBeenCalledWith(mockRequest);
    });
  });

  describe('API routes', () => {
    it('should allow access to auth API routes', async () => {
      mockRequest = createMockRequest('http://localhost:3000/api/auth/signin');
      mockProtectRoute.mockResolvedValue(null);

      const response = await middleware(mockRequest);

      expect(response).toBe(mockResponse);
    });

    it('should allow access to other API routes with authentication', async () => {
      mockRequest = createMockRequest('http://localhost:3000/api/users');
      mockProtectRoute.mockResolvedValue(null);

      const response = await middleware(mockRequest);

      expect(response).toBe(mockResponse);
    });

    it('should redirect unauthenticated users away from protected API routes', async () => {
      mockRequest = createMockRequest('http://localhost:3000/api/users');
      const redirectResponse = { status: 307, headers: { get: jest.fn(() => '/api/auth/signin') } };
      mockProtectRoute.mockResolvedValue(redirectResponse);

      const response = await middleware(mockRequest);

      expect(response).toBe(redirectResponse);
    });
  });

  describe('Error handling', () => {
    it('should handle protectRoute errors gracefully', async () => {
      mockRequest = createMockRequest('http://localhost:3000/admin');
      mockProtectRoute.mockRejectedValue(new Error('Service error'));

      // Middleware should catch the error and return NextResponse.next()
      const response = await middleware(mockRequest);

      expect(response).toBe(mockResponse);
      expect(mockProtectRoute).toHaveBeenCalledWith(mockRequest);
    });

    it('should handle malformed URLs', async () => {
      mockRequest = createMockRequest('http://localhost:3000/invalid-url');
      mockProtectRoute.mockResolvedValue(null);

      const response = await middleware(mockRequest);

      expect(response).toBe(mockResponse);
    });
  });

  describe('Service integration', () => {
    it('should use ServiceContainer to get middleware service', async () => {
      mockRequest = createMockRequest('http://localhost:3000/admin');
      mockProtectRoute.mockResolvedValue(null);

      const { ServiceContainer } = require('../../../src/services/ServiceContainer');
      
      await middleware(mockRequest);

      expect(ServiceContainer.getInstance).toHaveBeenCalled();
      expect(ServiceContainer.getInstance().getMiddlewareService).toHaveBeenCalled();
    });

    it('should call protectRoute with correct parameters', async () => {
      mockRequest = createMockRequest('http://localhost:3000/profile');
      mockProtectRoute.mockResolvedValue(null);

      await middleware(mockRequest);

      expect(mockProtectRoute).toHaveBeenCalledWith(mockRequest);
    });
  });
}); 