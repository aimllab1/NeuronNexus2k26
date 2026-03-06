import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface CursorContextType {
  isMagnetic: boolean;
  setIsMagnetic: (isMagnetic: boolean) => void;
}

const CursorContext = createContext<CursorContextType | undefined>(undefined);

export const CursorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isMagnetic, setIsMagnetic] = useState(false);

  return (
    <CursorContext.Provider value={{ isMagnetic, setIsMagnetic }}>
      {children}
    </CursorContext.Provider>
  );
};

export const useCursor = () => {
  const context = useContext(CursorContext);
  if (!context) {
    throw new Error('useCursor must be used within a CursorProvider');
  }
  return context;
};
