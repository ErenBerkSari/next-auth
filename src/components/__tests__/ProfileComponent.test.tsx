/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import ProfileComponent from '../ProfileComponent';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

jest.mock('next-auth/react');
jest.mock('next/navigation');

(useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });

describe('ProfileComponent', () => {
  it('should render profile component', () => {
    (useSession as jest.Mock).mockReturnValue({ 
      data: { 
        user: { 
          name: 'Test User', 
          email: 'test@example.com' 
        } 
      }, 
      status: 'authenticated' 
    });
    
    render(<ProfileComponent />);
    expect(screen.getByText('Profil Bilgileri')).toBeInTheDocument();
  });
}); 