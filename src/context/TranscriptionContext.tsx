import React, { createContext, useContext, useState } from 'react';

interface TranscriptionContextProps {
  isTranscriptionEnabled: boolean;
  toggleTranscription: () => void;
}

const TranscriptionContext = createContext<TranscriptionContextProps | undefined>(undefined);

interface TranscriptionProviderProps {
  children: React.ReactNode;
}

export const TranscriptionProvider: React.FC<TranscriptionProviderProps> = ({ children }) => {
  const [isTranscriptionEnabled, setIsTranscriptionEnabled] = useState(false);

  const toggleTranscription = () => {
    setIsTranscriptionEnabled((prev) => !prev);
  };

  return (
    <TranscriptionContext.Provider value={{ isTranscriptionEnabled, toggleTranscription }}>
      {children}
    </TranscriptionContext.Provider>
  );
};

export const useTranscription = () => {
  const context = useContext(TranscriptionContext);
  if (!context) {
    throw new Error('useVideo must be used within a VideoProvider');
  }
  return context;
};