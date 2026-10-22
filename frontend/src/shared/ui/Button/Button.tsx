type ButtonProps = {
  loading: boolean;
  label: string;
};

export const Button = ({ loading, label }: ButtonProps) => (
  <button
    type="submit"
    disabled={loading}
    className="mt-1 w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
  >
    {loading ? 'Загрузка...' : label}
  </button>
);
