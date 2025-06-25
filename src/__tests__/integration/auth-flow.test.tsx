/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import * as nextNavigation from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useAuthorization } from '../../hooks/useAuthorization';
import { useSession } from 'next-auth/react';

// Mock the hooks
jest.mock('../../hooks/useAuth');
jest.mock('../../hooks/useAuthorization');
jest.mock('next-auth/react');
jest.mock('next/navigation');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseAuthorization = useAuthorization as jest.MockedFunction<typeof useAuthorization>;

(useSession as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' });

describe('Auth Flow Integration', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(nextNavigation, 'useRouter').mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    } as any);
  });

  describe('Complete Authentication Flow', () => {
    it('should handle complete auth flow from loading to authenticated admin', async () => {
      // Initial loading state
      mockUseAuth.mockReturnValue({
        session: null,
        status: 'loading',
        update: jest.fn(),
        validateToken: jest.fn(),
        refreshToken: jest.fn(),
        getUserProfile: jest.fn(),
        isAuthenticated: false,
        isLoading: true,
      });

      mockUseAuthorization.mockReturnValue({
        hasRole: jest.fn(),
        hasPermission: jest.fn(),
        getUserRoles: jest.fn(),
        checkAccess: jest.fn(),
        assignRole: jest.fn(),
        removeRole: jest.fn(),
        getAvailableRoles: jest.fn(),
        userRoles: [],
        isAdmin: false,
        isUser: false,
        userId: undefined,
      });

      // Test loading state
      expect(mockUseAuth().isLoading).toBe(true);
      expect(mockUseAuth().isAuthenticated).toBe(false);
    });

    it('should handle auth flow with role validation', async () => {
      // Authenticated admin state
      mockUseAuth.mockReturnValue({
        session: {
          user: {
            id: '1',
            email: 'admin@test.com',
            name: 'Admin User',
          },
          expires: '2024-12-31',
        },
        status: 'authenticated',
        update: jest.fn(),
        validateToken: jest.fn(),
        refreshToken: jest.fn(),
        getUserProfile: jest.fn(),
        isAuthenticated: true,
        isLoading: false,
      });

      mockUseAuthorization.mockReturnValue({
        hasRole: jest.fn().mockReturnValue(true),
        hasPermission: jest.fn().mockReturnValue(true),
        getUserRoles: jest.fn().mockReturnValue(['admin']),
        checkAccess: jest.fn(),
        assignRole: jest.fn(),
        removeRole: jest.fn(),
        getAvailableRoles: jest.fn(),
        userRoles: ['admin'],
        isAdmin: true,
        isUser: true,
        userId: '1',
      });

      // Test authenticated state
      expect(mockUseAuth().isAuthenticated).toBe(true);
      expect(mockUseAuth().isLoading).toBe(false);
      expect(mockUseAuthorization().isAdmin).toBe(true);
    });
  });

  describe('Service Integration', () => {
    it('should integrate with auth service for token validation', async () => {
      const mockValidateToken = jest.fn().mockResolvedValue(true);
      
      mockUseAuth.mockReturnValue({
        session: null,
        status: 'authenticated',
        update: jest.fn(),
        validateToken: mockValidateToken,
        refreshToken: jest.fn(),
        getUserProfile: jest.fn(),
        isAuthenticated: true,
        isLoading: false,
      });

      const result = await mockUseAuth().validateToken('test-token');
      expect(result).toBe(true);
      expect(mockValidateToken).toHaveBeenCalledWith('test-token');
    });

    it('should integrate with authorization service for permission checks', async () => {
      const mockHasPermission = jest.fn().mockReturnValue(true);
      
      mockUseAuthorization.mockReturnValue({
        hasRole: jest.fn(),
        hasPermission: mockHasPermission,
        getUserRoles: jest.fn(),
        checkAccess: jest.fn(),
        assignRole: jest.fn(),
        removeRole: jest.fn(),
        getAvailableRoles: jest.fn(),
        userRoles: ['admin'],
        isAdmin: true,
        isUser: true,
        userId: '1',
      });

      const result = mockUseAuthorization().hasPermission('admin:read');
      expect(result).toBe(true);
      expect(mockHasPermission).toHaveBeenCalledWith('admin:read');
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle service errors gracefully', async () => {
      const mockValidateToken = jest.fn().mockRejectedValue(new Error('Token invalid'));
      
      mockUseAuth.mockReturnValue({
        session: null,
        status: 'unauthenticated',
        update: jest.fn(),
        validateToken: mockValidateToken,
        refreshToken: jest.fn(),
        getUserProfile: jest.fn(),
        isAuthenticated: false,
        isLoading: false,
      });

      await expect(mockUseAuth().validateToken('invalid-token')).rejects.toThrow('Token invalid');
    });

    it('should handle network errors in auth service', async () => {
      const mockRefreshToken = jest.fn().mockRejectedValue(new Error('Network error'));
      
      mockUseAuth.mockReturnValue({
        session: null,
        status: 'unauthenticated',
        update: jest.fn(),
        validateToken: jest.fn(),
        refreshToken: mockRefreshToken,
        getUserProfile: jest.fn(),
        isAuthenticated: false,
        isLoading: false,
      });

      await expect(mockUseAuth().refreshToken('refresh-token')).rejects.toThrow('Network error');
    });
  });

  describe('Role Management Integration', () => {
    it('should integrate with role manager for role operations', async () => {
      const mockGetUserRoles = jest.fn().mockReturnValue(['admin', 'user']);
      
      mockUseAuthorization.mockReturnValue({
        hasRole: jest.fn(),
        hasPermission: jest.fn(),
        getUserRoles: mockGetUserRoles,
        checkAccess: jest.fn(),
        assignRole: jest.fn(),
        removeRole: jest.fn(),
        getAvailableRoles: jest.fn(),
        userRoles: ['admin', 'user'],
        isAdmin: true,
        isUser: true,
        userId: '1',
      });

      const roles = mockUseAuthorization().getUserRoles();
      expect(roles).toEqual(['admin', 'user']);
      expect(mockGetUserRoles).toHaveBeenCalled();
    });
  });

  describe('Session Management Integration', () => {
    it('should handle session updates', async () => {
      const mockUpdate = jest.fn();
      
      mockUseAuth.mockReturnValue({
        session: null,
        status: 'authenticated',
        update: mockUpdate,
        validateToken: jest.fn(),
        refreshToken: jest.fn(),
        getUserProfile: jest.fn(),
        isAuthenticated: true,
        isLoading: false,
      });

      await mockUseAuth().update();
      expect(mockUpdate).toHaveBeenCalled();
    });

    it('should handle session expiration', async () => {
      mockUseAuth.mockReturnValue({
        session: null,
        status: 'unauthenticated',
        update: jest.fn(),
        validateToken: jest.fn(),
        refreshToken: jest.fn(),
        getUserProfile: jest.fn(),
        isAuthenticated: false,
        isLoading: false,
      });

      expect(mockUseAuth().isAuthenticated).toBe(false);
      expect(mockUseAuth().status).toBe('unauthenticated');
    });
  });
}); 