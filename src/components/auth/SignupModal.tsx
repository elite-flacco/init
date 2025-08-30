"use client";

import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { AuthModal } from "./AuthModal";
import { useAuthForm } from "../../hooks/useAuth";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  onSuccess?: () => void;
}

export function SignupModal({
  isOpen,
  onClose,
  onSwitchToLogin,
  onSuccess,
}: SignupModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { formState, setFormState, errors, loading, signUp, clearErrors } =
    useAuthForm();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await signUp();
    if (success) {
      setShowSuccess(true);
      // Auto-close after showing success for a moment
      setTimeout(() => {
        onSuccess?.();
        onClose();
        setShowSuccess(false);
      }, 2000);
    }
  };

  const handleClose = () => {
    clearErrors();
    setShowSuccess(false);
    onClose();
  };

  const handleSwitchToLogin = () => {
    clearErrors();
    setShowSuccess(false);
    onSwitchToLogin();
  };

  return (
    <AuthModal
      isOpen={isOpen}
      onClose={handleClose}
      title={showSuccess ? "Welcome to TripWise!" : "Create Account"}
    >
      {showSuccess ? (
        // Success Message
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Account Created Successfully!
            </h3>
            <p className="text-sm text-foreground-secondary">
              You can now save your travel plans and destinations. Welcome
              aboard!
            </p>
          </div>
        </div>
      ) : (
        // Signup Form
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <p className="text-sm text-foreground-secondary mb-4">
              Create an account to save your travel plans and personalize your
              experience.
            </p>
          </div>

          {/* Username */}
          <div>
            <label
              htmlFor="signup-username"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-foreground-secondary" />
              </div>
              <input
                id="signup-username"
                type="text"
                value={formState.fullName || ""}
                onChange={(e) => setFormState({ fullName: e.target.value })}
                className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your username"
                disabled={loading}
              />
            </div>
            {errors.fullName && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="signup-email"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-foreground-secondary" />
              </div>
              <input
                id="signup-email"
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
            <label
              htmlFor="signup-password"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-foreground-secondary" />
              </div>
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                value={formState.password}
                onChange={(e) => setFormState({ password: e.target.value })}
                className="block w-full pl-10 pr-10 py-2 border border-border rounded-lg bg-background text-foreground placeholder-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Create a password"
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

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="signup-confirm-password"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-foreground-secondary" />
              </div>
              <input
                id="signup-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={formState.confirmPassword || ""}
                onChange={(e) =>
                  setFormState({ confirmPassword: e.target.value })
                }
                className="block w-full pl-10 pr-10 py-2 border border-border rounded-lg bg-background text-foreground placeholder-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Confirm your password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-foreground-secondary hover:text-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-foreground-secondary hover:text-foreground" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Password Requirements */}
          <div className="text-xs text-foreground-secondary space-y-1">
            <p>Password requirements:</p>
            <ul className="ml-4 space-y-0.5">
              <li>• At least 8 characters</li>
              <li>• One uppercase letter</li>
              <li>• One lowercase letter</li>
              <li>• One number</li>
            </ul>
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
              {loading ? "Creating account..." : "Create Account"}
            </button>

            <div className="text-center">
              <span className="text-sm text-foreground-secondary">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={handleSwitchToLogin}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Sign in
                </button>
              </span>
            </div>
          </div>
        </form>
      )}
    </AuthModal>
  );
}
