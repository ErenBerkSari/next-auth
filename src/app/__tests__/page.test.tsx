/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import Page from '../page';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

jest.mock('next-auth/react');
jest.mock('next/navigation');

(useSession as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' });
(useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });

describe('Home Page', () => {
  it('should render the home page', () => {
    render(<Page />);
    expect(screen.getByText('Hoşgeldiniz')).toBeInTheDocument();
  });
}); 