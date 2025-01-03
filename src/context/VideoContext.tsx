import React, { createContext, useContext, useState } from 'react';

interface VideoContextProps {
  isVideoEnabled: boolean;
  isVideoActive: boolean;
  toggleVideo: () => void;
  setIsVideoActive: (flag: boolean) => void;
}

const VideoContext = createContext<VideoContextProps | undefined>(undefined);

interface VideoProviderProps {
  children: React.ReactNode;
}

export const VideoProvider: React.FC<VideoProviderProps> = ({ children }) => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);

  const toggleVideo = () => {
    setIsVideoEnabled((prev) => !prev);
  };

  return (
    <VideoContext.Provider value={{ isVideoEnabled, toggleVideo, isVideoActive, setIsVideoActive }}>
      {children}
    </VideoContext.Provider>
  );
};

export const useVideo = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideo must be used within a VideoProvider');
  }
  return context;
};