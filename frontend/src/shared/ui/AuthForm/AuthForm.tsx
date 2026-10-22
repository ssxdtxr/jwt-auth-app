import { type ComponentProps, type FC, type ReactNode } from 'react';
import { Alert } from '@/shared/ui/Alert';
import { Button } from '@/shared/ui/Button';

type AuthFormProps = {
  title: string;
  error?: string;
  loading: boolean;
  onSubmit: NonNullable<ComponentProps<'form'>['onSubmit']>;
  submitLabel: string;
  children?: ReactNode;
  footer?: ReactNode;
};

export const AuthForm: FC<AuthFormProps> = ({
  title,
  error,
  loading,
  onSubmit,
  submitLabel,
  children,
  footer,
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <form
      className="bg-white px-8 py-10 rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm flex flex-col gap-4"
      onSubmit={onSubmit}
    >
      <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">{title}</h1>

      {error && <Alert message={error} />}

      {children}

      <Button loading={loading} label={submitLabel} />

      {footer && (
        <div className="text-center text-sm text-gray-500">{footer}</div>
      )}
    </form>
  </div>
);
