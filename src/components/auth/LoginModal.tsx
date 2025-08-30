"use client";

import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { AuthModal } from './AuthModal';
import { useAuthForm } from '../../hooks/useAuth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
  onSuccess?: () => void;
}

export function LoginModal({ isOpen, onClose, onSwitchToSignup, onSuccess }: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const {
    formState,
    setFormState,
    errors,
    loading,
    signIn,
    resetPassword,
    clearErrors,
  } = useAuthForm();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await signIn();
    if (success) {
      onSuccess?.();
      onClose();
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await resetPassword();
    if (success) {
      setShowForgotPassword(false);
      // Show success message
      alert('Password reset email sent! Check your inbox.');
    }
  };

  const handleClose = () => {
    clearErrors();
    setShowForgotPassword(false);
    onClose();
  };

  const handleSwitchToSignup = () => {
    clearErrors();
    setShowForgotPassword(false);
    onSwitchToSignup();
  };

  return (
    <AuthModal
      isOpen={isOpen}
      onClose={handleClose}
      title={showForgotPassword ? "Reset Password" : "Welcome, TripWiser"}
    >
      {showForgotPassword ? (
        // Forgot Password Form
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div>
            <p className="text-sm text-foreground-secondary mb-4">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="reset-email" className="block text-sm font-medium text-foreground mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-foreground-secondary" />
              </div>
              <input
                id="reset-email"
                type="email"
                value={formState.email}
                onChange={(e) => setFormState({ email: e.target.value })}
                className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {errors.general}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col space-y-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-3d-primary py-2.5 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <button
              type="button"
              onClick={() => setShowForgotPassword(false)}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        </form>
      ) : (
        // Login Form
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <p className="text-sm text-foreground-secondary mb-4">
              Sign in to save your travel plans and destinations.
            </p>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-foreground mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-foreground-secondary" />
              </div>
              <input
                id="login-email"
                type="email"
                value={formState.email}
                onChange={(e) => setFormState({ email: e.target.value })}
                className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-foreground-secondary" />
              </div>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={formState.password}
                onChange={(e) => setFormState({ password: e.target.value })}
                className="block w-full pl-10 pr-10 py-2 border border-border rounded-lg bg-background text-foreground placeholder-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-foreground-secondary hover:text-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-foreground-secondary hover:text-foreground" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              Forgot your password?
            </button>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {errors.general}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col space-y-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-3d-primary py-2.5 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="text-center">
              <span className="text-sm text-foreground-secondary">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={handleSwitchToSignup}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Sign up
                </button>
              </span>
            </div>
          </div>
        </form>
      )}
    </AuthModal>
  );
}