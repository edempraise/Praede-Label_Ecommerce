import { FC } from 'react';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Input from '@/components/ui/input';

interface SignupFormProps {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors: any;
  loading: boolean;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (show: boolean) => void;
}

const SignupForm: FC<SignupFormProps> = ({
  formData,
  handleInputChange,
  errors,
  loading,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
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
        placeholder="Create a password"
      >
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </Input>
      <Input
        id="confirmPassword"
        name="confirmPassword"
        type={showConfirmPassword ? 'text' : 'password'}
        label="Confirm Password"
        Icon={Lock}
        value={formData.confirmPassword}
        onChange={handleInputChange}
        error={errors.confirmPassword}
        placeholder="Confirm your password"
      >
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </Input>
    </>
  );
};

export default SignupForm;
