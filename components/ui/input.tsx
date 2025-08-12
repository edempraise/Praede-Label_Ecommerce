import { FC, InputHTMLAttributes, ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  name: string;
  label: string;
  Icon: LucideIcon;
  error?: string;
  containerClassName?: string;
  children?: ReactNode;
}

const Input: FC<InputProps> = ({
  id,
  name,
  label,
  Icon,
  error,
  containerClassName = '',
  children,
  ...props
}) => {
  return (
    <div className={containerClassName}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1 relative">
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          id={id}
          name={name}
          {...props}
          className={`block w-full pl-10 pr-3 py-2 border ${
            error ? 'border-red-300' : 'border-gray-300'
          } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
        />
        {children}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;
