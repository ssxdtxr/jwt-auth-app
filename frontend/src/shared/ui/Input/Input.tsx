import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type InputProps = {
  label: string;
  type: 'email' | 'password' | 'text';
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
};

export const Input = ({ label, type, value, onChange, required, minLength, autoComplete }: InputProps) => {
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && visible ? 'text' : type;

  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
      {label}
      <span className="relative">
        <input
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-indigo-500 transition-colors pr-10"
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={visible ? 'Скрыть пароль' : 'Показать пароль'}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </span>
    </label>
  );
};
