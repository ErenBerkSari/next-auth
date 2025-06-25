export interface IAuthService {
  authenticateUser(credentials: any): Promise<any>;
  validateToken(token: string): Promise<boolean>;
  refreshToken(refreshToken: string): Promise<any>;
  getUserProfile(userId: string): Promise<any>;
}

export interface IAuthProvider {
  login(provider: string): Promise<void>;
  logout(): Promise<void>;
  getSession(): Promise<any>;
} 