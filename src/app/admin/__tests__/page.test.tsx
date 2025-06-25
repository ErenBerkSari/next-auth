/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import Page from '../page';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { useAuthorization } from '../../../hooks/useAuthorization';

jest.mock('next-auth/react');
jest.mock('next/navigation');
jest.mock('../../../hooks/useAuth');
jest.mock('../../../hooks/useAuthorization');

(useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });

describe('Admin Page', () => {
  it('should render the admin page', () => {
    (useSession as jest.Mock).mockReturnValue({ 
      data: { 
        user: { 
          name: 'Admin User', 
          email: 'admin@example.com' 
        } 
      }, 
      status: 'authenticated' 
    });
    
    (useAuth as jest.Mock).mockReturnValue({
      session: { user: { name: 'Admin User', email: 'admin@example.com' } },
      isAuthenticated: true,
      isLoading: false,
    });
    
    (useAuthorization as jest.Mock).mockReturnValue({
      isAdmin: true,
    });
    
    render(<Page />);
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });
}); 