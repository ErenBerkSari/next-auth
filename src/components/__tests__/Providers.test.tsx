/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import Providers from '../Providers';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  SessionProvider: ({ children, session }: { children: React.ReactNode; session: any }) => (
    <div data-testid="session-provider" data-session={session === undefined ? 'undefined' : JSON.stringify(session)}>
      {children}
    </div>
  ),
}));

describe('Providers', () => {
  const mockSession = {
    user: {
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
    },
    expires: '2024-12-31',
  };

  describe('with session', () => {
    it('should render SessionProvider with session', () => {
      render(
        <Providers session={mockSession}>
          <div data-testid="child">Child Component</div>
        </Providers>
      );

      const sessionProvider = screen.getByTestId('session-provider');
      expect(sessionProvider).toBeInTheDocument();
      expect(sessionProvider).toHaveAttribute('data-session', JSON.stringify(mockSession));
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('should pass session to SessionProvider', () => {
      render(
        <Providers session={mockSession}>
          <div>Child Component</div>
        </Providers>
      );

      const sessionProvider = screen.getByTestId('session-provider');
      const sessionData = JSON.parse(sessionProvider.getAttribute('data-session') || '{}');
      expect(sessionData).toEqual(mockSession);
    });
  });

  describe('without session', () => {
    it('should render SessionProvider with null session', () => {
      render(
        <Providers session={null}>
          <div data-testid="child">Child Component</div>
        </Providers>
      );

      const sessionProvider = screen.getByTestId('session-provider');
      expect(sessionProvider).toBeInTheDocument();
      expect(sessionProvider).toHaveAttribute('data-session', 'null');
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('should render SessionProvider with undefined session', () => {
      render(
        <Providers session={undefined}>
          <div data-testid="child">Child Component</div>
        </Providers>
      );

      const sessionProvider = screen.getByTestId('session-provider');
      expect(sessionProvider).toBeInTheDocument();
      expect(sessionProvider).toHaveAttribute('data-session', 'undefined');
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });
  });

  describe('children rendering', () => {
    it('should render multiple children', () => {
      render(
        <Providers session={mockSession}>
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
          <div data-testid="child3">Child 3</div>
        </Providers>
      );

      expect(screen.getByTestId('child1')).toBeInTheDocument();
      expect(screen.getByTestId('child2')).toBeInTheDocument();
      expect(screen.getByTestId('child3')).toBeInTheDocument();
    });

    it('should render complex children structure', () => {
      render(
        <Providers session={mockSession}>
          <div data-testid="container">
            <h1 data-testid="title">Title</h1>
            <p data-testid="description">Description</p>
          </div>
        </Providers>
      );

      expect(screen.getByTestId('container')).toBeInTheDocument();
      expect(screen.getByTestId('title')).toBeInTheDocument();
      expect(screen.getByTestId('description')).toBeInTheDocument();
    });
  });

  describe('session types', () => {
    it('should handle empty session object', () => {
      const emptySession = {};
      
      render(
        <Providers session={emptySession}>
          <div data-testid="child">Child Component</div>
        </Providers>
      );

      const sessionProvider = screen.getByTestId('session-provider');
      expect(sessionProvider).toHaveAttribute('data-session', '{}');
    });

    it('should handle session with only user info', () => {
      const userOnlySession = {
        user: {
          name: 'User Only',
        },
      };
      
      render(
        <Providers session={userOnlySession}>
          <div data-testid="child">Child Component</div>
        </Providers>
      );

      const sessionProvider = screen.getByTestId('session-provider');
      const sessionData = JSON.parse(sessionProvider.getAttribute('data-session') || '{}');
      expect(sessionData).toEqual(userOnlySession);
    });
  });
}); 