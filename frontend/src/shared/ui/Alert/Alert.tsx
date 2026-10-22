type AlertProps = {
  message: string;
};

export const Alert = ({ message }: AlertProps) => (
  <p role="alert" className="bg-red-50 text-red-600 border border-red-200 rounded-lg px-3 py-2 text-sm">
    {message}
  </p>
);
