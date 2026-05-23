'use client';

import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface SidebarCtx {
  isOpen: boolean;
  toggle: () => void;
}

const Ctx = createContext<SidebarCtx>({ isOpen: true, toggle: () => {} });

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <Ctx.Provider value={{ isOpen, toggle: () => setIsOpen(v => !v) }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSidebar() {
  return useContext(Ctx);
}
