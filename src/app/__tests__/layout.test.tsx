/**
 * @jest-environment jsdom
 */
jest.mock('next/font/google', () => ({
  Geist: () => ({ variable: 'geist-sans' }),
  Geist_Mono: () => ({ variable: 'geist-mono' }),
}));
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));
jest.mock('@/components/Providers', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="providers">{children}</div>,
}));
jest.mock('@/components/Navigation', () => ({
  __esModule: true,
  default: () => <nav data-testid="navigation">Navigation</nav>,
}));
jest.mock('../api/auth/[...nextauth]/route', () => ({
  authOptions: {},
}));

import { getServerSession } from 'next-auth';
import RootLayout, { metadata } from '../layout';
import { render, screen } from '@testing-library/react';

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

describe('RootLayout', () => {
  const mockSession = {
    user: {
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
    },
    expires: '2024-12-31',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('with session', () => {
    it('should render layout with authenticated session', async () => {
      mockGetServerSession.mockResolvedValue(mockSession as any);

      render(
        await RootLayout({
          children: <div data-testid="children">Test Content</div>,
        })
      );

      expect(screen.getByTestId('providers')).toBeInTheDocument();
      expect(screen.getByTestId('navigation')).toBeInTheDocument();
      expect(screen.getByTestId('children')).toBeInTheDocument();
    });
  });

  describe('without session', () => {
    it('should render layout without session', async () => {
      mockGetServerSession.mockResolvedValue(null);

      render(
        await RootLayout({
          children: <div data-testid="children">Test Content</div>,
        })
      );

      expect(screen.getByTestId('providers')).toBeInTheDocument();
      expect(screen.getByTestId('children')).toBeInTheDocument();
    });
  });

  describe('metadata', () => {
    it('should have correct metadata', () => {
      expect(metadata.title).toBe('NextAuth + Auth0 App');
      expect(metadata.description).toBe('NextAuth.js ile Auth0 entegrasyonu');
    });
  });
}); 