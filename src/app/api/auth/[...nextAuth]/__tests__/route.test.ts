import { NextRequest } from 'next/server';

// Mock NextAuth
jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    GET: jest.fn(),
    POST: jest.fn(),
  })),
}));

// Mock Auth0 provider
jest.mock('next-auth/providers/auth0', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    id: 'auth0',
    name: 'Auth0',
    type: 'oauth',
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    issuer: 'https://test.auth0.com',
  })),
}));

// Import after mocks
import { authOptions } from '../route';

describe('NextAuth API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    process.env.AUTH0_CLIENT_ID = 'test-client-id';
    process.env.AUTH0_CLIENT_SECRET = 'test-client-secret';
    process.env.AUTH0_ISSUER_BASE_URL = 'https://test.auth0.com';
  });

  describe('authOptions configuration', () => {
    it('should have correct provider configuration', () => {
      expect(authOptions.providers).toHaveLength(1);
      expect(authOptions.providers[0].id).toBe('auth0');
      expect(authOptions.providers[0].name).toBe('Auth0');
      expect(authOptions.providers[0].type).toBe('oauth');
    });

    it('should use environment variables for Auth0 configuration', () => {
      const auth0Provider = authOptions.providers[0] as any;
      expect(auth0Provider.clientId).toBe('test-client-id');
      expect(auth0Provider.clientSecret).toBe('test-client-secret');
      expect(auth0Provider.issuer).toBe('https://test.auth0.com');
    });

    it('should have JWT strategy configured', () => {
      expect(authOptions.session?.strategy).toBe('jwt');
    });

    it('should have callbacks configured', () => {
      expect(authOptions.callbacks).toBeDefined();
      expect(typeof authOptions.callbacks?.jwt).toBe('function');
      expect(typeof authOptions.callbacks?.session).toBe('function');
    });
  });

  describe('JWT callback', () => {
    it('should handle account information in JWT callback', async () => {
      const jwtCallback = authOptions.callbacks?.jwt;
      if (!jwtCallback) throw new Error('JWT callback not found');

      const mockToken = { sub: 'user123' };
      const mockAccount = {
        access_token: 'access-token-123',
        refresh_token: 'refresh-token-123',
        expires_at: 1234567890,
      };
      const mockProfile = {
        sub: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        picture: 'https://example.com/avatar.jpg',
      };

      const result = await jwtCallback({ token: mockToken, account: mockAccount, profile: mockProfile } as any);

      expect(result.accessToken).toBe('access-token-123');
      expect(result.refreshToken).toBe('refresh-token-123');
      expect(result.expiresAt).toBe(1234567890);
      expect(result.sub).toBe('user123');
      expect(result.name).toBe('Test User');
      expect(result.email).toBe('test@example.com');
      expect(result.picture).toBe('https://example.com/avatar.jpg');
    });

    it('should handle profile with custom roles', async () => {
      const jwtCallback = authOptions.callbacks?.jwt;
      if (!jwtCallback) throw new Error('JWT callback not found');

      const mockToken = { sub: 'user123' };
      const mockProfile = {
        sub: 'user123',
        name: 'Admin User',
        email: 'admin@example.com',
        'https://kayra-app.com/roles': 'admin',
      };

      const result = await jwtCallback({ token: mockToken, profile: mockProfile } as any);

      expect(result.role).toBe('admin');
    });

    it('should handle profile with array roles', async () => {
      const jwtCallback = authOptions.callbacks?.jwt;
      if (!jwtCallback) throw new Error('JWT callback not found');

      const mockToken = { sub: 'user123' };
      const mockProfile = {
        sub: 'user123',
        name: 'User',
        email: 'user@example.com',
        roles: ['user', 'moderator'],
      };

      const result = await jwtCallback({ token: mockToken, profile: mockProfile } as any);

      expect(result.role).toBe('user');
    });

    it('should default to user role when no role found', async () => {
      const jwtCallback = authOptions.callbacks?.jwt;
      if (!jwtCallback) throw new Error('JWT callback not found');

      const mockToken = { sub: 'user123' };
      const mockProfile = {
        sub: 'user123',
        name: 'User',
        email: 'user@example.com',
      };

      const result = await jwtCallback({ token: mockToken, profile: mockProfile } as any);

      expect(result.role).toBe('user');
    });

    it('should return token unchanged when no account or profile', async () => {
      const jwtCallback = authOptions.callbacks?.jwt;
      if (!jwtCallback) throw new Error('JWT callback not found');

      const mockToken = { sub: 'user123', role: 'user' };

      const result = await jwtCallback({ token: mockToken } as any);

      expect(result).toEqual(mockToken);
    });

    it('should handle different role namespace formats', async () => {
      const jwtCallback = authOptions.callbacks?.jwt;
      if (!jwtCallback) throw new Error('JWT callback not found');

      const mockToken = { sub: 'user123' };
      const mockProfile = {
        sub: 'user123',
        name: 'Manager User',
        email: 'manager@example.com',
        'https://kayra-app.com/roles': 'manager',
      };

      const result = await jwtCallback({ token: mockToken, profile: mockProfile } as any);

      expect(result.role).toBe('manager');
    });
  });

  describe('Session callback', () => {
    it('should transfer token data to session', async () => {
      const sessionCallback = authOptions.callbacks?.session;
      if (!sessionCallback) throw new Error('Session callback not found');

      const mockSession = {
        user: {
          name: 'Test User',
          email: 'test@example.com',
        },
      };
      const mockToken = {
        accessToken: 'access-token-123',
        sub: 'user123',
        role: 'admin',
      };

      const result = await sessionCallback({ session: mockSession, token: mockToken } as any) as any;

      expect(result.accessToken).toBe('access-token-123');
      expect(result.user?.id).toBe('user123');
      expect(result.user?.role).toBe('admin');
    });

    it('should preserve existing session user data', async () => {
      const sessionCallback = authOptions.callbacks?.session;
      if (!sessionCallback) throw new Error('Session callback not found');

      const mockSession = {
        user: {
          name: 'Test User',
          email: 'test@example.com',
          image: 'https://example.com/avatar.jpg',
        },
      };
      const mockToken = {
        accessToken: 'access-token-123',
        sub: 'user123',
        role: 'user',
      };

      const result = await sessionCallback({ session: mockSession, token: mockToken } as any) as any;

      expect(result.user?.name).toBe('Test User');
      expect(result.user?.email).toBe('test@example.com');
      expect(result.user?.image).toBe('https://example.com/avatar.jpg');
      expect(result.user?.id).toBe('user123');
      expect(result.user?.role).toBe('user');
    });

    it('should handle missing token properties gracefully', async () => {
      const sessionCallback = authOptions.callbacks?.session;
      if (!sessionCallback) throw new Error('Session callback not found');

      const mockSession = {
        user: {
          name: 'Test User',
          email: 'test@example.com',
        },
      };
      const mockToken = {
        sub: 'user123',
        // Missing accessToken and role
      };

      const result = await sessionCallback({ session: mockSession, token: mockToken } as any) as any;

      expect(result.user?.id).toBe('user123');
      expect(result.user?.role).toBeUndefined();
      expect(result.accessToken).toBeUndefined();
    });
  });

  describe('Environment variables', () => {
    it('should require AUTH0_CLIENT_ID', () => {
      const auth0Provider = authOptions.providers[0] as any;
      expect(auth0Provider.clientId).toBeDefined();
      expect(auth0Provider.clientId).toBe('test-client-id');
    });

    it('should require AUTH0_CLIENT_SECRET', () => {
      const auth0Provider = authOptions.providers[0] as any;
      expect(auth0Provider.clientSecret).toBeDefined();
      expect(auth0Provider.clientSecret).toBe('test-client-secret');
    });

    it('should require AUTH0_ISSUER_BASE_URL', () => {
      const auth0Provider = authOptions.providers[0] as any;
      expect(auth0Provider.issuer).toBeDefined();
      expect(auth0Provider.issuer).toBe('https://test.auth0.com');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete authentication flow', async () => {
      const jwtCallback = authOptions.callbacks?.jwt;
      const sessionCallback = authOptions.callbacks?.session;
      if (!jwtCallback || !sessionCallback) throw new Error('Callbacks not found');

      // Simulate Auth0 login
      const mockToken = { sub: 'user123' };
      const mockAccount = {
        access_token: 'access-token-123',
        refresh_token: 'refresh-token-123',
        expires_at: 1234567890,
      };
      const mockProfile = {
        sub: 'user123',
        name: 'Admin User',
        email: 'admin@example.com',
        picture: 'https://example.com/avatar.jpg',
        'https://kayra-app.com/roles': 'admin',
      };

      // JWT callback
      const jwtResult = await jwtCallback({ token: mockToken, account: mockAccount, profile: mockProfile } as any);

      // Session callback
      const mockSession = {
        user: {
          name: 'Admin User',
          email: 'admin@example.com',
        },
      };
      const sessionResult = await sessionCallback({ session: mockSession, token: jwtResult } as any) as any;

      // Verify complete flow
      expect(jwtResult.accessToken).toBe('access-token-123');
      expect(jwtResult.role).toBe('admin');
      expect(sessionResult.accessToken).toBe('access-token-123');
      expect(sessionResult.user?.id).toBe('user123');
      expect(sessionResult.user?.role).toBe('admin');
    });

    it('should handle role-based access control', async () => {
      const jwtCallback = authOptions.callbacks?.jwt;
      const sessionCallback = authOptions.callbacks?.session;
      if (!jwtCallback || !sessionCallback) throw new Error('Callbacks not found');

      // Test different roles
      const roles = ['user', 'admin', 'moderator'];
      
      for (const role of roles) {
        const mockToken = { sub: 'user123' };
        const mockProfile = {
          sub: 'user123',
          name: 'Test User',
          email: 'test@example.com',
          'https://kayra-app.com/roles': role,
        };

        const jwtResult = await jwtCallback({ token: mockToken, profile: mockProfile } as any);
        expect(jwtResult.role).toBe(role);
      }
    });
  });

  describe('Error handling', () => {
    it('should handle JWT callback errors gracefully', async () => {
      const jwtCallback = authOptions.callbacks?.jwt;
      if (!jwtCallback) throw new Error('JWT callback not found');

      const mockToken = { sub: 'user123' };
      const mockProfile = {
        sub: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        // Invalid profile data
        'https://kayra-app.com/roles': null,
      };

      const result = await jwtCallback({ token: mockToken, profile: mockProfile } as any);
      expect(result.role).toBe('user'); // Should default to 'user'
    });

    it('should handle session callback errors gracefully', async () => {
      const sessionCallback = authOptions.callbacks?.session;
      if (!sessionCallback) throw new Error('Session callback not found');

      const mockSession = {
        user: {
          name: 'Test User',
          email: 'test@example.com',
        },
      };
      const mockToken = {
        // Missing required properties
      };

      const result = await sessionCallback({ session: mockSession, token: mockToken } as any) as any;
      expect(result.user?.id).toBeUndefined();
      expect(result.user?.role).toBeUndefined();
    });
  });
}); 