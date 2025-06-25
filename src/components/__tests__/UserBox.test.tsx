/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import UserBox from '../UserBox';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

jest.mock('next-auth/react');
jest.mock('next/navigation');

(useSession as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' });
(useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });

describe('UserBox', () => {
  it('should render user box component', () => {
    render(<UserBox />);
    expect(screen.getByText('Hoşgeldiniz')).toBeInTheDocument();
  });
}); 