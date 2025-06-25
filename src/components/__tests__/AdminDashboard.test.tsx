/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import * as nextNavigation from 'next/navigation';
import AdminDashboard from '../AdminDashboard';
import { useAuth } from '../../hooks/useAuth';
import { useAuthorization } from '../../hooks/useAuthorization';

// Mock the services
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

// Mock the hooks
jest.mock('../../hooks/useAuth');
jest.mock('../../hooks/useAuthorization');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseAuthorization = useAuthorization as jest.MockedFunction<typeof useAuthorization>;

describe('AdminDashboard', () => {
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

  describe('Loading State', () => {
    it('should show loading spinner when authentication is loading', () => {
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

      render(<AdminDashboard />);

      expect(screen.getByText('Yükleniyor...')).toBeInTheDocument();
    });
  });

  describe('Unauthenticated User', () => {
    it('should redirect to signin page when user is not authenticated', async () => {
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

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/api/auth/signin');
      });
    });
  });

  describe('Authenticated Non-Admin User', () => {
    it('should redirect to home page when user is not admin', async () => {
      mockUseAuth.mockReturnValue({
        session: {
          user: {
            name: 'Test User',
            email: 'test@example.com',
            role: 'user',
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
        hasRole: jest.fn(),
        hasPermission: jest.fn(),
        getUserRoles: jest.fn(),
        checkAccess: jest.fn(),
        assignRole: jest.fn(),
        removeRole: jest.fn(),
        getAvailableRoles: jest.fn(),
        userRoles: ['user'],
        isAdmin: false,
        isUser: true,
        userId: 'user123',
      });

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('Access Denied Display', () => {
    it('should show access denied message for non-admin users', () => {
      mockUseAuth.mockReturnValue({
        session: {
          user: {
            name: 'Test User',
            email: 'test@example.com',
            role: 'user',
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
        hasRole: jest.fn(),
        hasPermission: jest.fn(),
        getUserRoles: jest.fn(),
        checkAccess: jest.fn(),
        assignRole: jest.fn(),
        removeRole: jest.fn(),
        getAvailableRoles: jest.fn(),
        userRoles: ['user'],
        isAdmin: false,
        isUser: true,
        userId: 'user123',
      });

      render(<AdminDashboard />);

      expect(screen.getByText('Erişim Reddedildi')).toBeInTheDocument();
      expect(screen.getByText('Bu sayfaya erişim yetkiniz yok.')).toBeInTheDocument();
      expect(screen.getByText('Ana Sayfaya Dön')).toBeInTheDocument();
    });
  });

  describe('Admin Dashboard Content', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        session: {
          user: {
            name: 'Admin User',
            email: 'admin@example.com',
            role: 'admin',
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
        hasRole: jest.fn(),
        hasPermission: jest.fn(),
        getUserRoles: jest.fn(),
        checkAccess: jest.fn(),
        assignRole: jest.fn(),
        removeRole: jest.fn(),
        getAvailableRoles: jest.fn(),
        userRoles: ['admin'],
        isAdmin: true,
        isUser: true,
        userId: 'admin123',
      });
    });

    it('should display admin dashboard title', () => {
      render(<AdminDashboard />);

      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    it('should display welcome message with user name', () => {
      render(<AdminDashboard />);

      expect(screen.getByText('Hoşgeldin, Admin User!')).toBeInTheDocument();
    });

    it('should display user role', () => {
      render(<AdminDashboard />);

      expect(screen.getByText(/Rol:/)).toBeInTheDocument();
      expect(screen.getByText('admin')).toBeInTheDocument();
    });

    it('should display statistics cards', () => {
      render(<AdminDashboard />);

      expect(screen.getByText('Toplam Kullanıcı')).toBeInTheDocument();
      expect(screen.getByText('1,234')).toBeInTheDocument();
      
      expect(screen.getByText('Aktif Oturum')).toBeInTheDocument();
      expect(screen.getByText('567')).toBeInTheDocument();
      
      expect(screen.getByText('Bugünkü Giriş')).toBeInTheDocument();
      expect(screen.getByText('89')).toBeInTheDocument();
    });

    it('should display quick action buttons', () => {
      render(<AdminDashboard />);

      expect(screen.getByText('Kullanıcı Yönetimi')).toBeInTheDocument();
      expect(screen.getByText('Sistem Ayarları')).toBeInTheDocument();
      expect(screen.getByText('Logları Görüntüle')).toBeInTheDocument();
      expect(screen.getByText('Yedekleme')).toBeInTheDocument();
    });
  });
}); 