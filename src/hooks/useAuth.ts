"use client";

import { useState, useCallback } from "react";
import { useAuth as useAuthContext } from "../contexts/AuthContext";
import { validateEmail, validatePassword } from "../lib/auth";

interface UseAuthFormState {
  email: string;
  password: string;
  fullName?: string;
  confirmPassword?: string;
}

interface UseAuthFormReturn {
  formState: UseAuthFormState;
  setFormState: (state: Partial<UseAuthFormState>) => void;
  errors: Record<string, string>;
  loading: boolean;
  signIn: () => Promise<boolean>;
  signUp: () => Promise<boolean>;
  resetPassword: () => Promise<boolean>;
  validateForm: (mode: "signin" | "signup") => boolean;
  clearErrors: () => void;
}

export function useAuthForm(): UseAuthFormReturn {
  const auth = useAuthContext();
  const [formState, setFormStateInternal] = useState<UseAuthFormState>({
    email: "",
    password: "",
    fullName: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const setFormState = useCallback((updates: Partial<UseAuthFormState>) => {
    setFormStateInternal((prev) => ({ ...prev, ...updates }));
    // Clear errors when user starts typing
    setErrors({});
  }, []);

  const validateForm = useCallback(
    (mode: "signin" | "signup"): boolean => {
      const newErrors: Record<string, string> = {};

      // Email validation
      if (!formState.email) {
        newErrors.email = "Email is required";
      } else if (!validateEmail(formState.email)) {
        newErrors.email = "Please enter a valid email address";
      }

      // Password validation
      if (!formState.password) {
        newErrors.password = "Password is required";
      } else if (mode === "signup") {
        const passwordValidation = validatePassword(formState.password);
        if (!passwordValidation.valid) {
          newErrors.password = passwordValidation.message!;
        }
      }

      // Signup-specific validations
      if (mode === "signup") {
        if (!formState.fullName?.trim()) {
          newErrors.fullName = "Username is required";
        }

        if (formState.password !== formState.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [formState],
  );

  const signIn = useCallback(async (): Promise<boolean> => {
    if (!validateForm("signin")) return false;

    setLoading(true);
    try {
      const result = await auth.signIn(formState.email, formState.password);
      if (result.error) {
        setErrors({ general: result.error });
        return false;
      }
      return true;
    } catch (error) {
      setErrors({ general: "An unexpected error occurred" });
      return false;
    } finally {
      setLoading(false);
    }
  }, [auth, formState, validateForm]);

  const signUp = useCallback(async (): Promise<boolean> => {
    if (!validateForm("signup")) return false;

    setLoading(true);
    try {
      const result = await auth.signUp(
        formState.email,
        formState.password,
        formState.fullName,
      );
      if (result.error) {
        setErrors({ general: result.error });
        return false;
      }
      return true;
    } catch (error) {
      setErrors({ general: "An unexpected error occurred" });
      return false;
    } finally {
      setLoading(false);
    }
  }, [auth, formState, validateForm]);

  const resetPassword = useCallback(async (): Promise<boolean> => {
    if (!formState.email) {
      setErrors({ email: "Email is required" });
      return false;
    }

    if (!validateEmail(formState.email)) {
      setErrors({ email: "Please enter a valid email address" });
      return false;
    }

    setLoading(true);
    try {
      const result = await auth.resetPassword(formState.email);
      if (result.error) {
        setErrors({ general: result.error });
        return false;
      }
      return true;
    } catch (error) {
      setErrors({ general: "An unexpected error occurred" });
      return false;
    } finally {
      setLoading(false);
    }
  }, [auth, formState]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    formState,
    setFormState,
    errors,
    loading: loading || auth.loading,
    signIn,
    signUp,
    resetPassword,
    validateForm,
    clearErrors,
  };
}

// Hook for managing user profile updates
export function useProfileUpdate() {
  const auth = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = useCallback(
    async (updates: { full_name?: string; avatar_url?: string }) => {
      setLoading(true);
      setError(null);

      try {
        const result = await auth.updateProfile(updates);
        if (result.error) {
          setError(result.error);
          return false;
        }
        return true;
      } catch (error) {
        setError("An unexpected error occurred");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [auth],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    updateProfile,
    loading,
    error,
    clearError,
  };
}
