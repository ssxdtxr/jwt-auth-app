import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { RegisterPage } from './RegisterPage';

const mockRegister = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@/shared/api', () => ({
  register: (...args: unknown[]) => mockRegister(...args),
}));

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useNavigate: () => mockNavigate,
}));

beforeEach(() => vi.clearAllMocks());

const renderPage = () => render(<MemoryRouter><RegisterPage /></MemoryRouter>);

describe('RegisterPage', () => {
  it('отображает поля email, пароль, подтверждение пароля и кнопку регистрации', () => {
    renderPage();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Пароль')).toBeInTheDocument();
    expect(screen.getByLabelText(/подтвердите пароль/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /зарегистрироваться/i })).toBeInTheDocument();
  });

  it('отображает ссылку на страницу входа', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /войти/i })).toBeInTheDocument();
  });

  it('вызывает apiRegister с введёнными данными при отправке', async () => {
    mockRegister.mockResolvedValue({});
    renderPage();

    await userEvent.type(screen.getByLabelText(/email/i), 'new@test.com');
    await userEvent.type(screen.getByLabelText('Пароль'), 'password123');
    await userEvent.type(screen.getByLabelText(/подтвердите пароль/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /зарегистрироваться/i }));

    expect(mockRegister).toHaveBeenCalledWith('new@test.com', 'password123');
  });

  it('переходит на /login после успешной регистрации', async () => {
    mockRegister.mockResolvedValue({});
    renderPage();

    await userEvent.type(screen.getByLabelText(/email/i), 'new@test.com');
    await userEvent.type(screen.getByLabelText('Пароль'), 'password123');
    await userEvent.type(screen.getByLabelText(/подтвердите пароль/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /зарегистрироваться/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'));
  });

  it('показывает ошибку если пароли не совпадают', async () => {
    renderPage();

    await userEvent.type(screen.getByLabelText(/email/i), 'new@test.com');
    await userEvent.type(screen.getByLabelText('Пароль'), 'password123');
    await userEvent.type(screen.getByLabelText(/подтвердите пароль/i), 'different');
    await userEvent.click(screen.getByRole('button', { name: /зарегистрироваться/i }));

    expect(screen.getByRole('alert')).toHaveTextContent('Пароли не совпадают');
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('показывает ошибку при неудачной регистрации', async () => {
    mockRegister.mockRejectedValue({ response: { data: { message: 'Пользователь уже существует' } } });
    renderPage();

    await userEvent.type(screen.getByLabelText(/email/i), 'taken@test.com');
    await userEvent.type(screen.getByLabelText('Пароль'), 'password123');
    await userEvent.type(screen.getByLabelText(/подтвердите пароль/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /зарегистрироваться/i }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Пользователь уже существует')
    );
  });
});
