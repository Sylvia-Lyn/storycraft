import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarContextType {
  selectedKnowledgeBase: { id: string; name: string } | null;
  setSelectedKnowledgeBase: (knowledgeBase: { id: string; name: string } | null) => void;
  showKnowledgePageOnRight: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

interface SidebarProviderProps {
  children: ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<{ id: string; name: string } | null>(null);

  const showKnowledgePageOnRight = selectedKnowledgeBase !== null;

  return (
    <SidebarContext.Provider
      value={{
        selectedKnowledgeBase,
        setSelectedKnowledgeBase,
        showKnowledgePageOnRight,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export { SidebarContext };