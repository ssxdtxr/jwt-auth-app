import { type ComponentProps, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '@/shared/auth';
import { AuthForm } from '@/shared/ui/AuthForm';
import { Input } from '@/shared/ui/Input';

export const LoginPage = () => {
  const { login } = useSession();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit: NonNullable<ComponentProps<'form'>['onSubmit']> = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(msg || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Вход"
      error={error}
      loading={loading}
      onSubmit={handleSubmit}
      submitLabel="Войти"
      footer={<p>Нет аккаунта? <Link className="text-indigo-600 hover:underline" to="/register">Зарегистрироваться</Link></p>}
    >
      <Input label="Email" type="email" value={email} onChange={setEmail} required autoComplete="email" />
      <Input label="Пароль" type="password" value={password} onChange={setPassword} required autoComplete="current-password" />
    </AuthForm>
  );
};
