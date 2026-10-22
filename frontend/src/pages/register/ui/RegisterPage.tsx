import { type ComponentProps, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as apiRegister } from '@/shared/api';
import { AuthForm } from '@/shared/ui/AuthForm';
import { Input } from '@/shared/ui/Input';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit: NonNullable<ComponentProps<'form'>['onSubmit']> = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Пароли не совпадают');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await apiRegister(email, password);
      navigate('/login');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(msg || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Регистрация"
      error={error}
      loading={loading}
      onSubmit={handleSubmit}
      submitLabel="Зарегистрироваться"
      footer={<p>Уже есть аккаунт? <Link className="text-indigo-600 hover:underline" to="/login">Войти</Link></p>}
    >
      <Input label="Email" type="email" value={email} onChange={setEmail} required autoComplete="email" />
      <Input label="Пароль" type="password" value={password} onChange={setPassword} required minLength={6} autoComplete="new-password" />
      <Input label="Подтвердите пароль" type="password" value={confirm} onChange={setConfirm} required minLength={6} autoComplete="new-password" />
    </AuthForm>
  );
};
