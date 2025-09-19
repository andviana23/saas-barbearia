'use client';

import { useState, useCallback } from 'react';
import { ConfirmDialogVariant } from '@/components/ui/DSConfirmDialog';

interface ConfirmDialogState {
  open: boolean;
  title: string;
  message: string;
  variant: ConfirmDialogVariant;
  confirmText: string;
  cancelText: string;
  details?: string;
  onConfirm: () => void;
  loading: boolean;
}

interface DeleteDialogState {
  open: boolean;
  title: string;
  itemName: string;
  itemType: string;
  message?: string;
  requireNameConfirmation: boolean;
  consequences: string[];
  onConfirm: () => void;
  loading: boolean;
}

interface UseConfirmDialogReturn {
  // Confirm Dialog
  confirmDialog: ConfirmDialogState;
  showConfirmDialog: (options: {
    title: string;
    message: string;
    variant?: ConfirmDialogVariant;
    confirmText?: string;
    cancelText?: string;
    details?: string;
    onConfirm: () => void | Promise<void>;
  }) => void;
  hideConfirmDialog: () => void;
  setConfirmLoading: (loading: boolean) => void;

  // Delete Dialog
  deleteDialog: DeleteDialogState;
  showDeleteDialog: (options: {
    title: string;
    itemName: string;
    itemType: string;
    message?: string;
    requireNameConfirmation?: boolean;
    consequences?: string[];
    onConfirm: () => void | Promise<void>;
  }) => void;
  hideDeleteDialog: () => void;
  setDeleteLoading: (loading: boolean) => void;
}

export function useConfirmDialog(): UseConfirmDialogReturn {
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    title: '',
    message: '',
    variant: 'warning',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    onConfirm: () => {},
    loading: false,
  });

  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    open: false,
    title: '',
    itemName: '',
    itemType: '',
    requireNameConfirmation: true,
    consequences: [],
    onConfirm: () => {},
    loading: false,
  });

  const showConfirmDialog = useCallback(
    (options: {
      title: string;
      message: string;
      variant?: ConfirmDialogVariant;
      confirmText?: string;
      cancelText?: string;
      details?: string;
      onConfirm: () => void | Promise<void>;
    }) => {
      const handleConfirm = async () => {
        try {
          setConfirmDialog((prev) => ({ ...prev, loading: true }));
          await options.onConfirm();
          hideConfirmDialog();
        } catch (error) {
          console.error('Erro ao executar confirmação:', error);
        } finally {
          setConfirmDialog((prev) => ({ ...prev, loading: false }));
        }
      };

      setConfirmDialog({
        open: true,
        title: options.title,
        message: options.message,
        variant: options.variant || 'warning',
        confirmText: options.confirmText || 'Confirmar',
        cancelText: options.cancelText || 'Cancelar',
        details: options.details,
        onConfirm: handleConfirm,
        loading: false,
      });
    },
    [],
  );

  const hideConfirmDialog = useCallback(() => {
    setConfirmDialog((prev) => ({ ...prev, open: false, loading: false }));
  }, []);

  const setConfirmLoading = useCallback((loading: boolean) => {
    setConfirmDialog((prev) => ({ ...prev, loading }));
  }, []);

  const showDeleteDialog = useCallback(
    (options: {
      title: string;
      itemName: string;
      itemType: string;
      message?: string;
      requireNameConfirmation?: boolean;
      consequences?: string[];
      onConfirm: () => void | Promise<void>;
    }) => {
      const handleConfirm = async () => {
        try {
          setDeleteDialog((prev) => ({ ...prev, loading: true }));
          await options.onConfirm();
          hideDeleteDialog();
        } catch (error) {
          console.error('Erro ao executar exclusão:', error);
        } finally {
          setDeleteDialog((prev) => ({ ...prev, loading: false }));
        }
      };

      setDeleteDialog({
        open: true,
        title: options.title,
        itemName: options.itemName,
        itemType: options.itemType,
        message: options.message,
        requireNameConfirmation: options.requireNameConfirmation ?? true,
        consequences: options.consequences || [],
        onConfirm: handleConfirm,
        loading: false,
      });
    },
    [],
  );

  const hideDeleteDialog = useCallback(() => {
    setDeleteDialog((prev) => ({ ...prev, open: false, loading: false }));
  }, []);

  const setDeleteLoading = useCallback((loading: boolean) => {
    setDeleteDialog((prev) => ({ ...prev, loading }));
  }, []);

  return {
    confirmDialog,
    showConfirmDialog,
    hideConfirmDialog,
    setConfirmLoading,
    deleteDialog,
    showDeleteDialog,
    hideDeleteDialog,
    setDeleteLoading,
  };
}