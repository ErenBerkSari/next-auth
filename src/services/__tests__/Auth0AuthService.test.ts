import { Auth0AuthService } from '../Auth0AuthService';

// Mock fetch globally
global.fetch = jest.fn();

describe('Auth0AuthService', () => {
  let authService: Auth0AuthService;

  beforeEach(() => {
    authService = new Auth0AuthService();
    jest.clearAllMocks();
  });

  describe('authenticateUser', () => {
    it('should successfully authenticate user with valid credentials', async () => {
      const mockResponse = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const credentials = {
        username: 'test@example.com',
        password: 'password123',
      };

      const result = await authService.authenticateUser(credentials);

      expect(fetch).toHaveBeenCalledWith(
        'https://test.auth0.com/oauth/token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when authentication fails', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const credentials = {
        username: 'test@example.com',
        password: 'wrongpassword',
      };

      await expect(authService.authenticateUser(credentials)).rejects.toThrow(
        'Authentication failed'
      );
    });

    it('should handle network errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const credentials = {
        username: 'test@example.com',
        password: 'password123',
      };

      await expect(authService.authenticateUser(credentials)).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('validateToken', () => {
    it('should return true for valid token', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sub: 'user123', email: 'test@example.com' }),
      });

      const result = await authService.validateToken('valid-token');

      expect(fetch).toHaveBeenCalledWith(
        'https://test.auth0.com/userinfo',
        {
          headers: {
            'Authorization': 'Bearer valid-token',
          },
        }
      );
      expect(result).toBe(true);
    });

    it('should return false for invalid token', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const result = await authService.validateToken('invalid-token');

      expect(result).toBe(false);
    });

    it('should return false on network error', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await authService.validateToken('token');

      expect(result).toBe(false);
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh token', async () => {
      const mockResponse = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: 3600,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await authService.refreshToken('old-refresh-token');

      expect(fetch).toHaveBeenCalledWith(
        'https://test.auth0.com/oauth/token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            grant_type: 'refresh_token',
            refresh_token: 'old-refresh-token',
            client_id: 'test-client-id',
            client_secret: 'test-client-secret',
          }),
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when token refresh fails', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      await expect(authService.refreshToken('invalid-refresh-token')).rejects.toThrow(
        'Token refresh failed'
      );
    });
  });

  describe('getUserProfile', () => {
    it('should successfully fetch user profile', async () => {
      const mockProfile = {
        user_id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfile,
      });

      const result = await authService.getUserProfile('user123');

      expect(fetch).toHaveBeenCalledWith(
        'https://test.auth0.com/api/v2/users/user123',
        {
          headers: {
            'Authorization': 'Bearer undefined',
          },
        }
      );
      expect(result).toEqual(mockProfile);
    });

    it('should throw error when profile fetch fails', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(authService.getUserProfile('nonexistent-user')).rejects.toThrow(
        'Failed to fetch user profile'
      );
    });
  });
}); 