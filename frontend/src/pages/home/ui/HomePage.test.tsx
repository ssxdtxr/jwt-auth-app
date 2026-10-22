import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from './HomePage';

const mockLogout = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@/shared/auth', () => ({
  useSession: () => ({
    user: { email: 'user@test.com', id: 'abc-123' },
    logout: mockLogout,
  }),
}));

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useNavigate: () => mockNavigate,
}));

beforeEach(() => vi.clearAllMocks());

const renderPage = () => render(<MemoryRouter><HomePage /></MemoryRouter>);

describe('HomePage', () => {
  it('отображает email пользователя', () => {
    renderPage();
    expect(screen.getByText('user@test.com')).toBeInTheDocument();
  });

  it('отображает id пользователя', () => {
    renderPage();
    expect(screen.getByText(/abc-123/)).toBeInTheDocument();
  });

  it('отображает кнопку выхода', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /выйти/i })).toBeInTheDocument();
  });

  it('вызывает logout и переходит на /login при клике на выход', async () => {
    mockLogout.mockResolvedValue(undefined);
    renderPage();

    await userEvent.click(screen.getByRole('button', { name: /выйти/i }));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledOnce();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
