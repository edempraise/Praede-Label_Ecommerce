import { FC } from 'react';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Input from '@/components/ui/input';

interface LoginFormProps {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors: any;
  loading: boolean;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
}

const LoginForm: FC<LoginFormProps> = ({
  formData,
  handleInputChange,
  errors,
  loading,
  showPassword,
  setShowPassword,
}) => {
  return (
    <>
      <Input
        id="email"
        name="email"
        type="email"
        label="Email address"
        Icon={Mail}
        value={formData.email}
        onChange={handleInputChange}
        error={errors.email}
        placeholder="Enter your email"
      />
      <Input
        id="password"
        name="password"
        type={showPassword ? 'text' : 'password'}
        label="Password"
        Icon={Lock}
        value={formData.password}
        onChange={handleInputChange}
        error={errors.password}
        placeholder="Enter your password"
      >
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </Input>
    </>
  );
};

export default LoginForm;
