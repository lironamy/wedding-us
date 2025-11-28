'use client';

import { useState, useCallback, ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'אישור',
  cancelText = 'ביטול',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const variantStyles = {
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
    info: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
  };

  const iconColors = {
    danger: 'text-red-500 bg-red-100',
    warning: 'text-yellow-500 bg-yellow-100',
    info: 'text-blue-500 bg-blue-100',
  };

  const icons = {
    danger: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    warning: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    info: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      size="sm"
      showCloseButton={false}
      footer={
        <>
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 sm:flex-none"
          >
            {cancelText}
          </Button>
          <button
            onClick={onConfirm}
            className={`flex-1 sm:flex-none px-4 py-2 text-white rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${variantStyles[variant]}`}
          >
            {confirmText}
          </button>
        </>
      }
    >
      <div className="text-center sm:text-right">
        <div className={`mx-auto sm:mx-0 w-12 h-12 rounded-full flex items-center justify-center mb-4 ${iconColors[variant]}`}>
          {icons[variant]}
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <div className="text-gray-600">{message}</div>
      </div>
    </Modal>
  );
}

// Hook for easier usage
export function useConfirmDialog() {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    title: string;
    message: ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
    onCancel: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {},
  });

  const showConfirm = useCallback(
    (options: {
      title: string;
      message: ReactNode;
      confirmText?: string;
      cancelText?: string;
      variant?: 'danger' | 'warning' | 'info';
    }): Promise<boolean> => {
      return new Promise((resolve) => {
        setDialogState({
          isOpen: true,
          ...options,
          onConfirm: () => {
            setDialogState((prev) => ({ ...prev, isOpen: false }));
            resolve(true);
          },
          onCancel: () => {
            setDialogState((prev) => ({ ...prev, isOpen: false }));
            resolve(false);
          },
        });
      });
    },
    []
  );

  const ConfirmDialogComponent = (
    <ConfirmDialog
      isOpen={dialogState.isOpen}
      title={dialogState.title}
      message={dialogState.message}
      confirmText={dialogState.confirmText}
      cancelText={dialogState.cancelText}
      variant={dialogState.variant}
      onConfirm={dialogState.onConfirm}
      onCancel={dialogState.onCancel}
    />
  );

  return { showConfirm, ConfirmDialogComponent };
}
