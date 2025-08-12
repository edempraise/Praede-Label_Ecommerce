'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { useAuthForm } from '@/hooks/useAuthForm';
import LoginForm from './auth/LoginForm';
import SignupForm from './auth/SignupForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  redirectTo?: string;
}

const AuthModal = ({
  isOpen,
  onClose,
  initialMode = 'login',
  redirectTo = '/',
}: AuthModalProps) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const {
    formData,
    loading,
    errors,
    handleInputChange,
    handleSubmit,
    setFormData,
    setErrors,
  } = useAuthForm(mode, onClose, redirectTo);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    resetForm();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Centered Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md bg-white rounded-lg shadow-xl p-6"
            >
              {/* Close Button */}
              <button
                type="button"
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <div className="mx-auto h-12 w-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-xl">E</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  {mode === 'login'
                    ? 'Sign in to your account'
                    : 'Create your account'}
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  {mode === 'login'
                    ? "Don't have an account? "
                    : 'Already have an account? '}
                  <button
                    type="button"
                    onClick={switchMode}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    {mode === 'login' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'login' ? (
                  <LoginForm
                    formData={formData}
                    handleInputChange={handleInputChange}
                    errors={errors}
                    loading={loading}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                  />
                ) : (
                  <SignupForm
                    formData={formData}
                    handleInputChange={handleInputChange}
                    errors={errors}
                    loading={loading}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    showConfirmPassword={showConfirmPassword}
                    setShowConfirmPassword={setShowConfirmPassword}
                  />
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {mode === 'login' ? 'Sign in' : 'Create Account'}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;