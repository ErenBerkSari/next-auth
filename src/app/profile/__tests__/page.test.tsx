/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import Page from '../page';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

jest.mock('next-auth/react');
jest.mock('next/navigation');

(useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });

describe('Profile Page', () => {
  it('should render the profile page', () => {
    (useSession as jest.Mock).mockReturnValue({ 
      data: { 
        user: { 
          name: 'Test User', 
          email: 'test@example.com' 
        } 
      }, 
      status: 'authenticated' 
    });
    
    render(<Page />);
    expect(screen.getByText('Profil Bilgileri')).toBeInTheDocument();
  });
}); 