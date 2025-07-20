import React, { createContext, useContext, useState } from 'react';

interface IconSizeContextType {
  iconSize: number;
  setIconSize: (size: number) => void;
}

const IconSizeContext = createContext<IconSizeContextType>({
  iconSize: 24,
  setIconSize: () => {},
});

export const useIconSize = () => useContext(IconSizeContext);

export const IconSizeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [iconSize, setIconSize] = useState(24);
  return (
    <IconSizeContext.Provider value={{ iconSize, setIconSize }}>
      {children}
    </IconSizeContext.Provider>
  );
}; 