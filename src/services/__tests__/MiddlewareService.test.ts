import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { MiddlewareService } from '../MiddlewareService';

// Mock next-auth/jwt
jest.mock('next-auth/jwt');
const mockGetToken = getToken as jest.MockedFunction<typeof getToken>;

// Mock NextResponse
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    next: jest.fn(() => ({ status: 200 })),
    redirect: jest.fn((url: string) => ({ 
      status: 307, 
      headers: { get: (key: string) => (key === 'location' ? url.toString() : undefined) }
    })),
  },
}));

describe('MiddlewareService', () => {
  let middlewareService: MiddlewareService;
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    middlewareService = new MiddlewareService();
    
    // Set environment variable
    process.env.AUTH0_SECRET = 'test-secret';
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

  describe('protectRoute', () => {
    describe('Public routes', () => {
      it('should allow access to public routes', async () => {
        mockRequest = createMockRequest('http://localhost:3000');
        
        const result = await middlewareService.protectRoute(mockRequest);
        
        expect(result).toBeNull();
      });

      it('should allow access to non-protected paths', async () => {
        mockRequest = createMockRequest('http://localhost:3000/about');
        
        const result = await middlewareService.protectRoute(mockRequest);
        
        expect(result).toBeNull();
      });
    });

    describe('Protected routes without authentication', () => {
      it('should redirect to signin when accessing admin without token', async () => {
        mockRequest = createMockRequest('http://localhost:3000/admin');
        mockGetToken.mockResolvedValue(null);
        
        const result = await middlewareService.protectRoute(mockRequest);
        
        expect(result).toHaveProperty('status', 307);
        expect(result?.headers.get('location')).toContain('/api/auth/signin');
        expect(mockGetToken).toHaveBeenCalledWith({
          req: mockRequest,
          secret: 'test-secret'
        });
      });

      it('should redirect to signin when accessing profile without token', async () => {
        mockRequest = createMockRequest('http://localhost:3000/profile');
        mockGetToken.mockResolvedValue(null);
        
        const result = await middlewareService.protectRoute(mockRequest);
        
        expect(result).toHaveProperty('status', 307);
        expect(result?.headers.get('location')).toContain('/api/auth/signin');
      });
    });

    describe('Protected routes with authentication', () => {
      it('should allow admin user to access admin route', async () => {
        mockRequest = createMockRequest('http://localhost:3000/admin');
        mockGetToken.mockResolvedValue({
          sub: '1',
          email: 'admin@test.com',
          role: 'admin'
        } as any);
        
        const result = await middlewareService.protectRoute(mockRequest);
        
        expect(result).toBeNull();
      });

      it('should allow user to access profile route', async () => {
        mockRequest = createMockRequest('http://localhost:3000/profile');
        mockGetToken.mockResolvedValue({
          sub: '2',
          email: 'user@test.com',
          role: 'user'
        } as any);
        
        const result = await middlewareService.protectRoute(mockRequest);
        
        expect(result).toBeNull();
      });

      it('should allow admin user to access profile route', async () => {
        mockRequest = createMockRequest('http://localhost:3000/profile');
        mockGetToken.mockResolvedValue({
          sub: '1',
          email: 'admin@test.com',
          role: 'admin'
        } as any);
        
        const result = await middlewareService.protectRoute(mockRequest);
        
        expect(result).toBeNull();
      });
    });

    describe('Role-based access control', () => {
      it('should redirect non-admin user from admin route', async () => {
        mockRequest = createMockRequest('http://localhost:3000/admin');
        mockGetToken.mockResolvedValue({
          sub: '2',
          email: 'user@test.com',
          role: 'user'
        } as any);
        
        const result = await middlewareService.protectRoute(mockRequest, ['admin']);
        
        expect(result).toHaveProperty('status', 307);
        expect(result?.headers.get('location')).toContain('/unauthorized');
      });

      it('should allow user with required role', async () => {
        mockRequest = createMockRequest('http://localhost:3000/profile');
        mockGetToken.mockResolvedValue({
          sub: '2',
          email: 'user@test.com',
          role: 'user'
        } as any);
        
        const result = await middlewareService.protectRoute(mockRequest, ['user', 'admin']);
        
        expect(result).toBeNull();
      });

      it('should handle array roles correctly', async () => {
        mockRequest = createMockRequest('http://localhost:3000/admin');
        mockGetToken.mockResolvedValue({
          sub: '1',
          email: 'admin@test.com',
          role: ['admin', 'user']
        } as any);
        
        const result = await middlewareService.protectRoute(mockRequest, ['admin']);
        
        expect(result).toBeNull();
      });
    });

    describe('Error handling', () => {
      it('should handle getToken errors gracefully', async () => {
        mockRequest = createMockRequest('http://localhost:3000/admin');
        mockGetToken.mockRejectedValue(new Error('Token error'));
        
        const result = await middlewareService.protectRoute(mockRequest);
        
        expect(result).toHaveProperty('status', 307);
        expect(result?.headers.get('location')).toContain('/api/auth/signin');
      });

      it('should handle network errors', async () => {
        mockRequest = createMockRequest('http://localhost:3000/admin');
        mockGetToken.mockRejectedValue(new Error('Network error'));
        
        const result = await middlewareService.protectRoute(mockRequest);
        
        expect(result).toHaveProperty('status', 307);
        expect(result?.headers.get('location')).toContain('/api/auth/signin');
      });
    });
  });

  describe('validateRequest', () => {
    it('should return true for valid token', async () => {
      mockRequest = createMockRequest('http://localhost:3000');
      mockGetToken.mockResolvedValue({
        sub: '1',
        email: 'user@test.com'
      } as any);
      
      const result = await middlewareService.validateRequest(mockRequest);
      
      expect(result).toBe(true);
      expect(mockGetToken).toHaveBeenCalledWith({
        req: mockRequest,
        secret: 'test-secret'
      });
    });

    it('should return false for invalid token', async () => {
      mockRequest = createMockRequest('http://localhost:3000');
      mockGetToken.mockResolvedValue(null);
      
      const result = await middlewareService.validateRequest(mockRequest);
      
      expect(result).toBe(false);
    });

    it('should return false on token error', async () => {
      mockRequest = createMockRequest('http://localhost:3000');
      mockGetToken.mockRejectedValue(new Error('Token error'));
      
      const result = await middlewareService.validateRequest(mockRequest);
      
      expect(result).toBe(false);
    });
  });

  describe('Protected paths management', () => {
    it('should return protected paths', () => {
      const paths = middlewareService.getProtectedPaths();
      
      expect(paths).toContain('/profile');
      expect(paths).toContain('/admin');
    });

    it('should add new protected path', () => {
      middlewareService.addProtectedPath('/dashboard');
      
      const paths = middlewareService.getProtectedPaths();
      expect(paths).toContain('/dashboard');
    });

    it('should not add duplicate protected path', () => {
      middlewareService.addProtectedPath('/admin');
      
      const paths = middlewareService.getProtectedPaths();
      const adminCount = paths.filter(path => path === '/admin').length;
      expect(adminCount).toBe(1);
    });

    it('should remove protected path', () => {
      middlewareService.removeProtectedPath('/profile');
      
      const paths = middlewareService.getProtectedPaths();
      expect(paths).not.toContain('/profile');
      expect(paths).toContain('/admin');
    });
  });

  describe('Role management', () => {
    it('should get required roles for path', () => {
      const adminRoles = middlewareService.getRequiredRoles('/admin');
      const profileRoles = middlewareService.getRequiredRoles('/profile');
      
      expect(adminRoles).toEqual(['admin']);
      expect(profileRoles).toEqual(['user', 'admin']);
    });

    it('should return empty array for unknown path', () => {
      const roles = middlewareService.getRequiredRoles('/unknown');
      
      expect(roles).toEqual([]);
    });

    it('should set route roles', () => {
      middlewareService.setRouteRoles('/dashboard', ['admin', 'manager']);
      
      const roles = middlewareService.getRequiredRoles('/dashboard');
      expect(roles).toEqual(['admin', 'manager']);
    });
  });

  describe('Access control', () => {
    it('should allow access when no role requirements', async () => {
      const result = await middlewareService.canAccess('user1', '/public');
      
      expect(result).toBe(true);
    });

    it('should allow access for user with required role', async () => {
      const result = await middlewareService.canAccess('user1', '/profile');
      
      expect(result).toBe(true);
    });

    it('should allow access for admin to admin route', async () => {
      const result = await middlewareService.canAccess('admin1', '/admin');
      
      expect(result).toBe(true);
    });
  });

  describe('Path matching', () => {
    it('should match exact protected paths', async () => {
      mockRequest = createMockRequest('http://localhost:3000/admin');
      mockGetToken.mockResolvedValue(null);
      
      const result = await middlewareService.protectRoute(mockRequest);
      
      expect(result).toHaveProperty('status', 307);
    });

    it('should match sub-paths of protected routes', async () => {
      mockRequest = createMockRequest('http://localhost:3000/admin/users');
      mockGetToken.mockResolvedValue(null);
      
      const result = await middlewareService.protectRoute(mockRequest);
      
      expect(result).toHaveProperty('status', 307);
    });

    it('should not match non-protected paths', async () => {
      mockRequest = createMockRequest('http://localhost:3000/about');
      
      const result = await middlewareService.protectRoute(mockRequest);
      
      expect(result).toBeNull();
    });
  });
}); 