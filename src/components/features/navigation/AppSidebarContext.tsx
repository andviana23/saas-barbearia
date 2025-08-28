'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface AppSidebarContextType {
  isOpen: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
  setMobile: (mobile: boolean) => void;
}

const AppSidebarContext = createContext<AppSidebarContextType | undefined>(undefined);

export function AppSidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);
  const openSidebar = () => setIsOpen(true);
  const setMobile = (mobile: boolean) => setIsMobile(mobile);

  return (
    <AppSidebarContext.Provider
      value={{
        isOpen,
        isMobile,
        toggleSidebar,
        closeSidebar,
        openSidebar,
        setMobile,
      }}
    >
      {children}
    </AppSidebarContext.Provider>
  );
}

export function useAppSidebar() {
  const context = useContext(AppSidebarContext);
  if (context === undefined) {
    throw new Error('useAppSidebar must be used within an AppSidebarProvider');
  }
  return context;
}
