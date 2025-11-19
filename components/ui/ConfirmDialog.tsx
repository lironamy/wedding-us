'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
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
  if (!isOpen) return null;

  const variantStyles = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-blue-600 hover:bg-blue-700',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 text-white rounded-lg transition ${variantStyles[variant]}`}
          >
            {confirmText}
          </button>
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            {cancelText}
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Hook for easier usage
export function useConfirmDialog() {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showConfirm = useCallback(
    (options: {
      title: string;
      message: string;
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
        });
      });
    },
    []
  );

  const handleCancel = useCallback(() => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const ConfirmDialogComponent = (
    <ConfirmDialog
      isOpen={dialogState.isOpen}
      title={dialogState.title}
      message={dialogState.message}
      confirmText={dialogState.confirmText}
      cancelText={dialogState.cancelText}
      variant={dialogState.variant}
      onConfirm={dialogState.onConfirm}
      onCancel={handleCancel}
    />
  );

  return { showConfirm, ConfirmDialogComponent };
}
