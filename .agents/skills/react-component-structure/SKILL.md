# React Component Structure

Conventions for writing React components in this project.
Apply these rules to every new and modified component file.

---

## Rules

### 1. One file = one component

Each `.tsx` file exports exactly one React component. Helper sub-components
that are not reused outside the file may live in the same file, but only as
unexported constants above the main export.

```tsx
// ✅ correct — one exported component, private helper above
const Label: React.FC<LabelProps> = ({ text }) => (
  <span className="text-sm text-gray-600">{text}</span>
);

export const InputField: React.FC<InputFieldProps> = ({ label, ...rest }) => (
  <label>
    <Label text={label} />
    <input {...rest} />
  </label>
);

// ❌ wrong — two exports from one file
export const Label = ...
export const InputField = ...
```

### 2. No `function` keyword for components

All components are arrow functions assigned to a `const`.

```tsx
// ✅
export const UserCard: React.FC<UserCardProps> = ({ name }) => <div>{name}</div>;

// ❌
export function UserCard({ name }: UserCardProps) { return <div>{name}</div>; }
```

Hooks and event handlers inside a component body follow the same rule — use
arrow functions.

```tsx
// ✅
const handleClick = async (): Promise<void> => { ... };
const fetchData = useCallback(async () => { ... }, []);

// ❌
async function handleClick() { ... }
```

### 3. `type` for component props

Component prop shapes are declared with `type`, never `interface`.

```tsx
// ✅
type ButtonProps = {
  label: string;
  disabled?: boolean;
  onClick: () => void;
};

export const Button: React.FC<ButtonProps> = ({ label, disabled, onClick }) => ...;

// ❌
interface ButtonProps { ... }
```

### 4. `interface` only for external contracts

`interface` is reserved for API response/request shapes and module contracts —
structures that represent a boundary with an external system and may be
extended or implemented elsewhere.

```tsx
// ✅ — server response contract
interface LoginResponse {
  accessToken: string;
  user: { id: string; email: string };
}

// ✅ — repository/service contract
interface UserRepository {
  findById(id: string): Promise<User | null>;
}

// ❌ — component props are not a contract
interface CardProps { ... }
```

### 5. No `export default`

All exports are named exports. This keeps refactoring safe and makes
imports unambiguous.

```tsx
// ✅
export const LoginPage: React.FC = () => { ... };

// ❌
export default function LoginPage() { ... }
// ❌
const LoginPage = () => { ... };
export default LoginPage;
```

---

## Quick reference

| What | Rule |
|---|---|
| Files per component | 1 exported component per `.tsx` file |
| Component syntax | `const X: React.FC<Props> = () => { ... }` |
| Event handlers | Arrow functions: `const handle = async () => { ... }` |
| Props shape | `type XProps = { ... }` |
| API / contracts | `interface XResponse { ... }` |
| Default exports | Forbidden — use named exports only |

---

## Examples

### Component with props

```tsx
type AlertProps = {
  message: string;
  variant?: 'error' | 'info';
};

export const Alert: React.FC<AlertProps> = ({ message, variant = 'info' }) => (
  <p role="alert" className={variant === 'error' ? 'text-red-600' : 'text-blue-600'}>
    {message}
  </p>
);
```

### Component with children

```tsx
type CardProps = {
  title: string;
  children: React.ReactNode;
};

export const Card: React.FC<CardProps> = ({ title, children }) => (
  <div className="rounded-xl border p-4">
    <h2 className="font-bold">{title}</h2>
    {children}
  </div>
);
```

### Component with async handler

```tsx
type LogoutButtonProps = {
  onLogout: () => Promise<void>;
};

export const LogoutButton: React.FC<LogoutButtonProps> = ({ onLogout }) => {
  const handleClick = async (): Promise<void> => {
    await onLogout();
  };

  return (
    <button onClick={handleClick}>Sign Out</button>
  );
};
```
