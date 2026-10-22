import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@/shared/auth', () => ({
  useSession: () => ({ login: mockLogin }),
}));

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useNavigate: () => mockNavigate,
}));

beforeEach(() => vi.clearAllMocks());

const renderPage = () => render(<MemoryRouter><LoginPage /></MemoryRouter>);

describe('LoginPage', () => {
  it('отображает поля email, пароль и кнопку входа', () => {
    renderPage();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Пароль')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument();
  });

  it('отображает ссылку на страницу регистрации', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /зарегистрироваться/i })).toBeInTheDocument();
  });

  it('вызывает session.login с введёнными данными при отправке', async () => {
    mockLogin.mockResolvedValue(undefined);
    renderPage();

    await userEvent.type(screen.getByLabelText(/email/i), 'user@test.com');
    await userEvent.type(screen.getByLabelText('Пароль'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /войти/i }));

    expect(mockLogin).toHaveBeenCalledWith('user@test.com', 'password123');
  });

  it('переходит на / после успешного входа', async () => {
    mockLogin.mockResolvedValue(undefined);
    renderPage();

    await userEvent.type(screen.getByLabelText(/email/i), 'user@test.com');
    await userEvent.type(screen.getByLabelText('Пароль'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /войти/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
  });

  it('показывает сообщение об ошибке от сервера при неудачном входе', async () => {
    mockLogin.mockRejectedValue({ response: { data: { message: 'Неверные учётные данные' } } });
    renderPage();

    await userEvent.type(screen.getByLabelText(/email/i), 'user@test.com');
    await userEvent.type(screen.getByLabelText('Пароль'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /войти/i }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Неверные учётные данные')
    );
  });

  it('показывает запасную ошибку если ответ не содержит сообщения', async () => {
    mockLogin.mockRejectedValue(new Error('Network error'));
    renderPage();

    await userEvent.type(screen.getByLabelText(/email/i), 'user@test.com');
    await userEvent.type(screen.getByLabelText('Пароль'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /войти/i }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Ошибка входа')
    );
  });
});
