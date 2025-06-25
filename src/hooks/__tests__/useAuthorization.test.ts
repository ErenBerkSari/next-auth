/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useAuthorization } from '../useAuthorization';
import { ServiceContainer } from '../../services/ServiceContainer';

// Mock dependencies
jest.mock('next-auth/react');
jest.mock('../../services/ServiceContainer', () => ({
  ServiceContainer: {
    getInstance: jest.fn(() => ({
      getAuthService: jest.fn(),
      getAuthorizationService: jest.fn(),
      getRoleManager: jest.fn(),
      getMiddlewareService: jest.fn(),
    })),
  },
}));
jest.mock('../../services/MiddlewareService', () => ({}));

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockServiceContainer = ServiceContainer.getInstance as jest.MockedFunction<typeof ServiceContainer.getInstance>;

describe('useAuthorization', () => {
  const mockAuthService = {
    hasRole: jest.fn(),
    hasPermission: jest.fn(),
    getUserRoles: jest.fn(),
    checkAccess: jest.fn(),
  };

  const mockRoleManager = {
    assignRole: jest.fn(),
    removeRole: jest.fn(),
    getAvailableRoles: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockServiceContainer.mockReturnValue({
      getAuthorizationService: () => mockAuthService,
      getRoleManager: () => mockRoleManager,
    } as any);
  });

  describe('when user is not authenticated', () => {
    it('should return default values for unauthenticated user', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      const { result } = renderHook(() => useAuthorization());

      expect(result.current.userId).toBeUndefined();
      expect(result.current.userRoles).toEqual([]);
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isUser).toBe(false);
    });

    it('should return false for role and permission checks', async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      const { result } = renderHook(() => useAuthorization());

      const hasRole = await result.current.hasRole('admin');
      const hasPermission = await result.current.hasPermission('read');

      expect(hasRole).toBe(false);
      expect(hasPermission).toBe(false);
    });

    it('should return empty array for user roles', async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      const { result } = renderHook(() => useAuthorization());

      const userRoles = await result.current.getUserRoles();

      expect(userRoles).toEqual([]);
    });
  });

  describe('when user is authenticated', () => {
    const mockSession = {
      user: {
        id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      },
      expires: '2024-12-31',
    };

    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
        update: jest.fn(),
      });
    });

    it('should return user ID', () => {
      const { result } = renderHook(() => useAuthorization());

      expect(result.current.userId).toBe('user123');
    });

    it('should return user roles as array', () => {
      const { result } = renderHook(() => useAuthorization());

      expect(result.current.userRoles).toEqual(['user']);
    });

    it('should correctly identify admin user', () => {
      mockUseSession.mockReturnValue({
        data: {
          ...mockSession,
          user: { ...mockSession.user, role: 'admin' },
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      const { result } = renderHook(() => useAuthorization());

      expect(result.current.userRoles).toEqual(['admin']);
      expect(result.current.isAdmin).toBe(true);
      expect(result.current.isUser).toBe(true);
    });

    it('should correctly identify regular user', () => {
      const { result } = renderHook(() => useAuthorization());

      expect(result.current.userRoles).toEqual(['user']);
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isUser).toBe(true);
    });

    it('should handle array roles', () => {
      mockUseSession.mockReturnValue({
        data: {
          ...mockSession,
          user: { ...mockSession.user, role: ['admin', 'user'] },
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      const { result } = renderHook(() => useAuthorization());

      expect(result.current.userRoles).toEqual(['admin', 'user']);
      expect(result.current.isAdmin).toBe(true);
      expect(result.current.isUser).toBe(true);
    });
  });

  describe('hasRole', () => {
    it('should call auth service hasRole method', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: 'user123', name: 'Test User', email: 'test@example.com', role: 'user' },
          expires: '2024-12-31',
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      mockAuthService.hasRole.mockResolvedValue(true);

      const { result } = renderHook(() => useAuthorization());

      const hasRole = await result.current.hasRole('admin');

      expect(mockAuthService.hasRole).toHaveBeenCalledWith('user123', 'admin');
      expect(hasRole).toBe(true);
    });

    it('should return false when user ID is not available', async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      const { result } = renderHook(() => useAuthorization());

      const hasRole = await result.current.hasRole('admin');

      expect(hasRole).toBe(false);
      expect(mockAuthService.hasRole).not.toHaveBeenCalled();
    });
  });

  describe('hasPermission', () => {
    it('should call auth service hasPermission method', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: 'user123', name: 'Test User', email: 'test@example.com', role: 'user' },
          expires: '2024-12-31',
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      mockAuthService.hasPermission.mockResolvedValue(true);

      const { result } = renderHook(() => useAuthorization());

      const hasPermission = await result.current.hasPermission('read');

      expect(mockAuthService.hasPermission).toHaveBeenCalledWith('user123', 'read');
      expect(hasPermission).toBe(true);
    });

    it('should return false when user ID is not available', async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      const { result } = renderHook(() => useAuthorization());

      const hasPermission = await result.current.hasPermission('read');

      expect(hasPermission).toBe(false);
      expect(mockAuthService.hasPermission).not.toHaveBeenCalled();
    });
  });

  describe('getUserRoles', () => {
    it('should call auth service getUserRoles method', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: 'user123', name: 'Test User', email: 'test@example.com', role: 'user' },
          expires: '2024-12-31',
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      mockAuthService.getUserRoles.mockResolvedValue(['user', 'admin']);

      const { result } = renderHook(() => useAuthorization());

      const userRoles = await result.current.getUserRoles();

      expect(mockAuthService.getUserRoles).toHaveBeenCalledWith('user123');
      expect(userRoles).toEqual(['user', 'admin']);
    });

    it('should return empty array when user ID is not available', async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      const { result } = renderHook(() => useAuthorization());

      const userRoles = await result.current.getUserRoles();

      expect(userRoles).toEqual([]);
      expect(mockAuthService.getUserRoles).not.toHaveBeenCalled();
    });
  });

  describe('checkAccess', () => {
    it('should call auth service checkAccess method', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: 'user123', name: 'Test User', email: 'test@example.com', role: 'user' },
          expires: '2024-12-31',
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      mockAuthService.checkAccess.mockResolvedValue(true);

      const { result } = renderHook(() => useAuthorization());

      const hasAccess = await result.current.checkAccess('users', 'read');

      expect(mockAuthService.checkAccess).toHaveBeenCalledWith('user123', 'users', 'read');
      expect(hasAccess).toBe(true);
    });

    it('should return false when user ID is not available', async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      const { result } = renderHook(() => useAuthorization());

      const hasAccess = await result.current.checkAccess('users', 'read');

      expect(hasAccess).toBe(false);
      expect(mockAuthService.checkAccess).not.toHaveBeenCalled();
    });
  });

  describe('assignRole', () => {
    it('should call role manager assignRole method', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: 'user123', name: 'Test User', email: 'test@example.com', role: 'user' },
          expires: '2024-12-31',
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      const { result } = renderHook(() => useAuthorization());

      await act(async () => {
        await result.current.assignRole('admin');
      });

      expect(mockRoleManager.assignRole).toHaveBeenCalledWith('user123', 'admin');
    });

    it('should not call assignRole when user ID is not available', async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      const { result } = renderHook(() => useAuthorization());

      await act(async () => {
        await result.current.assignRole('admin');
      });

      expect(mockRoleManager.assignRole).not.toHaveBeenCalled();
    });
  });

  describe('removeRole', () => {
    it('should call role manager removeRole method', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: 'user123', name: 'Test User', email: 'test@example.com', role: 'user' },
          expires: '2024-12-31',
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      const { result } = renderHook(() => useAuthorization());

      await act(async () => {
        await result.current.removeRole('admin');
      });

      expect(mockRoleManager.removeRole).toHaveBeenCalledWith('user123', 'admin');
    });

    it('should not call removeRole when user ID is not available', async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      const { result } = renderHook(() => useAuthorization());

      await act(async () => {
        await result.current.removeRole('admin');
      });

      expect(mockRoleManager.removeRole).not.toHaveBeenCalled();
    });
  });

  describe('getAvailableRoles', () => {
    it('should call role manager getAvailableRoles method', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: 'user123', name: 'Test User', email: 'test@example.com', role: 'user' },
          expires: '2024-12-31',
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      mockRoleManager.getAvailableRoles.mockResolvedValue(['admin', 'user', 'guest']);

      const { result } = renderHook(() => useAuthorization());

      const availableRoles = await result.current.getAvailableRoles();

      expect(mockRoleManager.getAvailableRoles).toHaveBeenCalled();
      expect(availableRoles).toEqual(['admin', 'user', 'guest']);
    });
  });
}); 