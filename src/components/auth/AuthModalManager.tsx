"use client";

import React, { useState } from "react";
import { LoginModal } from "./LoginModal";
import { SignupModal } from "./SignupModal";

type AuthModalType = "login" | "signup" | null;

interface AuthModalManagerProps {
  initialModal?: AuthModalType;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthModalManager({
  initialModal = "login",
  isOpen,
  onClose,
  onSuccess,
}: AuthModalManagerProps) {
  const [currentModal, setCurrentModal] = useState<AuthModalType>(initialModal);

  const handleClose = () => {
    setCurrentModal(initialModal);
    onClose();
  };

  const handleSuccess = () => {
    onSuccess?.();
    handleClose();
  };

  return (
    <>
      <LoginModal
        isOpen={isOpen && currentModal === "login"}
        onClose={handleClose}
        onSwitchToSignup={() => setCurrentModal("signup")}
        onSuccess={handleSuccess}
      />
      <SignupModal
        isOpen={isOpen && currentModal === "signup"}
        onClose={handleClose}
        onSwitchToLogin={() => setCurrentModal("login")}
        onSuccess={handleSuccess}
      />
    </>
  );
}

// Hook for managing auth modal state
export function useAuthModal(initialModal: AuthModalType = "login") {
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<AuthModalType>(initialModal);

  const openModal = (type: AuthModalType = "login") => {
    setModalType(type);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const openLogin = () => openModal("login");
  const openSignup = () => openModal("signup");

  return {
    isOpen,
    modalType,
    openModal,
    closeModal,
    openLogin,
    openSignup,
  };
}
