import { useNavigate } from 'react-router-dom';
import { useSession } from '@/shared/auth';

export const HomePage = () => {
  const { user, logout } = useSession();
  const navigate = useNavigate();

  const handleLogout = async (): Promise<void> => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white px-10 py-12 rounded-2xl shadow-sm border border-gray-100 text-center min-w-[280px]">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Добро пожаловать!</h1>
        <p className="text-lg font-semibold text-gray-800 mb-1">{user?.email}</p>
        <p className="text-xs text-gray-400 mb-8 break-all">ID: {user?.id}</p>
        <button
          className="px-6 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors cursor-pointer"
          onClick={handleLogout}
        >
          Выйти
        </button>
      </div>
    </div>
  );
};
