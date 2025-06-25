/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useAuth } from '../useAuth';
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

describe('useAuth', () => {
  const mockAuthService = {
    validateToken: jest.fn(),
    refreshToken: jest.fn(),
    getUserProfile: jest.fn(),
  };

  const mockUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockServiceContainer.mockReturnValue({
      getAuthService: () => mockAuthService,
    } as any);
  });

  describe('when user is loading', () => {
    it('should return loading state', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
        update: mockUpdate,
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.status).toBe('loading');
    });
  });

  describe('when user is unauthenticated', () => {
    it('should return unauthenticated state', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: mockUpdate,
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.status).toBe('unauthenticated');
    });
  });

  describe('when user is authenticated', () => {
    const mockSession = {
      user: {
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      },
      expires: '2024-12-31',
    };

    it('should return authenticated state', () => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
        update: mockUpdate,
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.status).toBe('authenticated');
      expect(result.current.session).toEqual(mockSession);
    });
  });

  describe('validateToken', () => {
    it('should call auth service validateToken method', async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: mockUpdate,
      });

      mockAuthService.validateToken.mockResolvedValue(true);

      const { result } = renderHook(() => useAuth());

      const token = 'test-token';
      const isValid = await result.current.validateToken(token);

      expect(mockAuthService.validateToken).toHaveBeenCalledWith(token);
      expect(isValid).toBe(true);
    });

    it('should handle validation errors', async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: mockUpdate,
      });

      mockAuthService.validateToken.mockRejectedValue(new Error('Invalid token'));

      const { result } = renderHook(() => useAuth());

      const token = 'invalid-token';

      await expect(result.current.validateToken(token)).rejects.toThrow('Invalid token');
      expect(mockAuthService.validateToken).toHaveBeenCalledWith(token);
    });
  });

  describe('refreshToken', () => {
    it('should call auth service refreshToken method', async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: mockUpdate,
      });

      const mockRefreshResponse = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: 3600,
      };

      mockAuthService.refreshToken.mockResolvedValue(mockRefreshResponse);

      const { result } = renderHook(() => useAuth());

      const refreshToken = 'old-refresh-token';
      const response = await result.current.refreshToken(refreshToken);

      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(refreshToken);
      expect(response).toEqual(mockRefreshResponse);
    });

    it('should handle refresh errors', async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: mockUpdate,
      });

      mockAuthService.refreshToken.mockRejectedValue(new Error('Refresh failed'));

      const { result } = renderHook(() => useAuth());

      const refreshToken = 'invalid-refresh-token';

      await expect(result.current.refreshToken(refreshToken)).rejects.toThrow('Refresh failed');
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(refreshToken);
    });
  });

  describe('getUserProfile', () => {
    it('should call auth service getUserProfile method', async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: mockUpdate,
      });

      const mockProfile = {
        user_id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
      };

      mockAuthService.getUserProfile.mockResolvedValue(mockProfile);

      const { result } = renderHook(() => useAuth());

      const userId = 'user123';
      const profile = await result.current.getUserProfile(userId);

      expect(mockAuthService.getUserProfile).toHaveBeenCalledWith(userId);
      expect(profile).toEqual(mockProfile);
    });

    it('should handle profile fetch errors', async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: mockUpdate,
      });

      mockAuthService.getUserProfile.mockRejectedValue(new Error('Profile not found'));

      const { result } = renderHook(() => useAuth());

      const userId = 'nonexistent-user';

      await expect(result.current.getUserProfile(userId)).rejects.toThrow('Profile not found');
      expect(mockAuthService.getUserProfile).toHaveBeenCalledWith(userId);
    });
  });

  describe('update function', () => {
    it('should return the update function from useSession', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: mockUpdate,
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.update).toBe(mockUpdate);
    });
  });
}); 