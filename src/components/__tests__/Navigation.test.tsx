/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import Navigation from '../Navigation';
import { useSession } from 'next-auth/react';
jest.mock('next-auth/react');

(useSession as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' });

describe('Navigation', () => {
  it('should render navigation component', () => {
    render(<Navigation />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
}); 