import { IAuthService } from './interfaces/IAuthService';
import { getToken } from 'next-auth/jwt';

export class Auth0AuthService implements IAuthService {
  private readonly secret: string;

  constructor() {
    this.secret = process.env.AUTH0_SECRET || '';
  }

  async authenticateUser(credentials: any): Promise<any> {
    try {
      // Auth0 authentication logic
      const response = await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Auth0 authentication error:', error);
      throw error;
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      // For token validation, we'll use a different approach
      // since getToken expects a request object, not a token string
      const response = await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/userinfo`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      return response.ok;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  async refreshToken(refreshToken: string): Promise<any> {
    try {
      const response = await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: process.env.AUTH0_CLIENT_ID,
          client_secret: process.env.AUTH0_CLIENT_SECRET,
        }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  async getUserProfile(userId: string): Promise<any> {
    try {
      const response = await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.AUTH0_MANAGEMENT_API_TOKEN}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  }
} 