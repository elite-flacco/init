"use client";

import React from "react";
import { X, AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: "text-red-500",
          iconBg: "bg-red-50",
          confirmBtn: "btn-3d-danger",
        };
      case "warning":
        return {
          icon: "text-yellow-500",
          iconBg: "bg-yellow-50",
          confirmBtn: "btn-3d-warning",
        };
      default:
        return {
          icon: "text-blue-500",
          iconBg: "bg-blue-50",
          confirmBtn: "btn-3d-primary",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-[100] transition-opacity duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />

      {/* Dialog */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-background border border-border rounded-lg shadow-2xl w-full max-w-md transform transition-all duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <div
                className={`w-8 h-8 ${styles.iconBg} rounded-full flex items-center justify-center`}
              >
                <AlertTriangle className={`w-4 h-4 ${styles.icon}`} />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            </div>
            {!isLoading && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-background-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-foreground-secondary" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-sm text-foreground-secondary">{message}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 p-4 border-t border-border">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="btn-3d-outline px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`${styles.confirmBtn} px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-white">Processing...</span>
                </div>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
