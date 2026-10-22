import { AuthProvider } from '@/shared/auth';
import { AppRouter } from './router';

export const App: React.FC = () => (
  <AuthProvider>
    <AppRouter />
  </AuthProvider>
);
