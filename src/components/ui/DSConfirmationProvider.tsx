'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import DSConfirmDialog from './DSConfirmDialog';
import DSDeleteDialog from './DSDeleteDialog';

interface ConfirmationContextType {
  showConfirmDialog: ReturnType<typeof useConfirmDialog>['showConfirmDialog'];
  showDeleteDialog: ReturnType<typeof useConfirmDialog>['showDeleteDialog'];
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

interface DSConfirmationProviderProps {
  children: ReactNode;
}

export function DSConfirmationProvider({ children }: DSConfirmationProviderProps) {
  const {
    confirmDialog,
    showConfirmDialog,
    hideConfirmDialog,
    deleteDialog,
    showDeleteDialog,
    hideDeleteDialog,
  } = useConfirmDialog();

  const contextValue: ConfirmationContextType = {
    showConfirmDialog,
    showDeleteDialog,
  };

  return (
    <ConfirmationContext.Provider value={contextValue}>
      {children}
      
      <DSConfirmDialog
        open={confirmDialog.open}
        onClose={hideConfirmDialog}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        details={confirmDialog.details}
        loading={confirmDialog.loading}
      />

      <DSDeleteDialog
        open={deleteDialog.open}
        onClose={hideDeleteDialog}
        onConfirm={deleteDialog.onConfirm}
        title={deleteDialog.title}
        itemName={deleteDialog.itemName}
        itemType={deleteDialog.itemType}
        message={deleteDialog.message}
        requireNameConfirmation={deleteDialog.requireNameConfirmation}
        consequences={deleteDialog.consequences}
        loading={deleteDialog.loading}
      />
    </ConfirmationContext.Provider>
  );
}

export function useConfirmation(): ConfirmationContextType {
  const context = useContext(ConfirmationContext);
  if (context === undefined) {
    throw new Error('useConfirmation must be used within a DSConfirmationProvider');
  }
  return context;
}