import { type ComponentProps } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthForm } from './AuthForm';

const defaultProps = {
  title: 'Test Title',
  onSubmit: vi.fn((e: { preventDefault(): void }) => e.preventDefault()),
  submitLabel: 'Submit',
  loading: false,
};

const renderForm = (props: Partial<ComponentProps<typeof AuthForm>> = {}) =>
  render(
    <MemoryRouter>
      <AuthForm {...defaultProps} {...props} />
    </MemoryRouter>
  );

describe('AuthForm', () => {
  it('renders the title', () => {
    renderForm();
    expect(screen.getByRole('heading', { name: 'Test Title' })).toBeInTheDocument();
  });

  it('renders the submit button with correct label', () => {
    renderForm();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('does not render an error when not provided', () => {
    renderForm();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders the error message with role="alert"', () => {
    renderForm({ error: 'Something went wrong' });
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
  });

  it('renders children inside the form', () => {
    renderForm({ children: <input data-testid="custom-field" /> });
    expect(screen.getByTestId('custom-field')).toBeInTheDocument();
  });

  it('renders the footer', () => {
    renderForm({ footer: <a href="/login">Sign In</a> });
    expect(screen.getByRole('link', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('показывает "Загрузка..." и блокирует кнопку при loading=true', () => {
    renderForm({ loading: true });
    const btn = screen.getByRole('button', { name: 'Загрузка...' });
    expect(btn).toBeDisabled();
  });

  it('calls onSubmit when the form is submitted', async () => {
    const onSubmit = vi.fn((e: { preventDefault(): void }) => e.preventDefault());
    renderForm({ onSubmit });
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });
});
