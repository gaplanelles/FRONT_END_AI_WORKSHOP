// import React, {
//   createContext,
//   useCallback,
//   useContext,
//   useRef,
//   useState,
// } from "react";

// interface TranscriptionContextProps {
//   isTranscriptionEnabled: boolean;
//   toggleTranscription: () => void;
//   transcription: string;
//   setTranscription: (transcription: string) => void;
//   isListening: boolean;
//   startListening: () => void;
//   stopListening: () => void;
//   restartListening: () => void;
//   toggleListening: () => void;
//   setupLanguageSetting: (language: string) => void;
//   selectedLanguage: string;
//   setSelectedLanguage: (language: string) => void;
// }

// const TranscriptionContext = createContext<
//   TranscriptionContextProps | undefined
// >(undefined);

// interface TranscriptionProviderProps {
//   children: React.ReactNode;
// }
// declare global {
//   interface SpeechRecognitionEvent extends Event {
//     results: SpeechRecognitionResultList;
//   }

//   interface SpeechRecognition {
//     continuous: boolean;
//     interimResults: boolean;
//     lang: string;
//     start(): void;
//     stop(): void;
//     onresult: (event: SpeechRecognitionEvent) => void;
//     onerror: (event: any) => void;
//     onend: () => void;
//   }

//   interface Window {
//     SpeechRecognition: { new (): SpeechRecognition };
//     webkitSpeechRecognition: { new (): SpeechRecognition };
//   }
// }

// export const TranscriptionProvider: React.FC<TranscriptionProviderProps> = ({
//   children,
// }) => {
//   const [transcription, setTranscription] = useState("");
//   const [isTranscriptionEnabled, setIsTranscriptionEnabled] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const [recognition, setRecognition] = useState<SpeechRecognition | null>(
//     null
//   );
//   const recognitionRef = useRef<SpeechRecognition | null>(null);
//   const [selectedLanguage, setSelectedLanguage] = useState("");

//   const startListening = useCallback(() => {
//     setIsListening(true);
//     setTranscription("");
//     if ("webkitSpeechRecognition" in window) {
//       const SpeechRecognition = window.webkitSpeechRecognition;
//       recognitionRef.current = new SpeechRecognition();

//       if (recognitionRef.current) {
//         recognitionRef.current.continuous = true;
//         recognitionRef.current.interimResults = true;

//         if (selectedLanguage) {
//           recognitionRef.current.lang = selectedLanguage;
//         }

//         recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
//           let currentTranscript = "";
//           for (let i = 0; i < event.results.length; i++) {
//             currentTranscript += event.results[i][0].transcript;
//           }
//           setTranscription(currentTranscript);
//         };

//         recognitionRef.current.onend = () => {
//           if (isListening) {
//             recognitionRef.current?.start();
//           } else {
//             setIsListening(false);
//           }
//         };

//         recognitionRef.current.start();
//       }
//     }
//   }, [selectedLanguage, isListening]);

//   const stopListening = useCallback(() => {
//     setIsListening(false);
//     if (recognitionRef.current) {
//       recognitionRef.current.stop();
//     }
//   }, []);

//   const restartListening = useCallback(async () => {
//     if (recognitionRef.current) {
//       recognitionRef.current.stop();
//       await new Promise((resolve) => setTimeout(resolve, 200));
//       setTranscription("");
//       recognitionRef.current.start();
//       setIsListening(true);
//     }
//   }, []);

//   const setupLanguageSetting = useCallback(async (selectedLanguage: string) => {
//     setSelectedLanguage(selectedLanguage);
//     if (recognitionRef.current) {
//       recognitionRef.current.lang = selectedLanguage;
//       recognitionRef.current.stop();
//       await new Promise((resolve) => setTimeout(resolve, 200));
//       setTranscription("");
//       if (isListening) {
//         recognitionRef.current.start();
//         setIsListening(true);
//       }
//     }
//   }, []);

//   const toggleListening = () => {
//     if (isListening) {
//       stopListening();
//     } else {
//       startListening();
//     }
//   };

//   const toggleTranscription = () => {
//     if (!recognitionRef.current) {
//       // const newRecognition = setupSpeechRecognition();
//       // if (newRecognition) {
//       //   setRecognition(newRecognition);
//       // }
//       debugger;
//       startListening();
//     }

//     if (isTranscriptionEnabled) {
//       recognition?.stop();
//     } else {
//       recognition?.start();
//     }

//     setIsTranscriptionEnabled((prev) => !prev);
//   };

//   const setupSpeechRecognition = () => {
//     const SpeechRecognition =
//       (window as any).SpeechRecognition ||
//       (window as any).webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//       console.error("Speech Recognition API is not supported in this browser");
//       return null;
//     }

//     const recognition = new SpeechRecognition();
//     recognition.continuous = true;
//     recognition.interimResults = false;
//     recognition.lang = "en-US";

//     recognition.onresult = (event: SpeechRecognitionEvent) => {
//       for (const result of event.results) {
//         if (result.isFinal) {
//           // const capturedText = event.results[0][0].transcript;
//           console.log("Captured text:", result);
//         }
//       }
//     };

//     recognition.onerror = (event: any) => {
//       console.error("Speech recognition error:", event.error);
//     };

//     return recognition;
//   };
//   return (
//     <TranscriptionContext.Provider
//       value={{
//         isTranscriptionEnabled,
//         toggleTranscription,
//         transcription,
//         setTranscription,
//         isListening,
//         startListening,
//         stopListening,
//         restartListening,
//         toggleListening,
//         selectedLanguage,
//         setSelectedLanguage,
//         setupLanguageSetting,
//       }}
//     >
//       {children}
//     </TranscriptionContext.Provider>
//   );
// };

// export const useTranscription = () => {
//   const context = useContext(TranscriptionContext);
//   if (!context) {
//     throw new Error("useVideo must be used within a VideoProvider");
//   }
//   return context;
// };

// Ten kod powinien być w pliku TranscriptionContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
  useRef,
} from "react";

interface TranscriptionContextType {
  transcription: string;
  setTranscription: (transcription: string) => void;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  restartListening: () => void;
  toggleListening: () => void;
  setupLanguageSetting: (language: string) => void;
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
}

const TranscriptionContext = createContext<
  TranscriptionContextType | undefined
>(undefined);

export const TranscriptionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [transcription, setTranscription] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startListening = useCallback(() => {
    setIsListening(true);
    setTranscription("");
    if ("webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        if (selectedLanguage) {
          recognitionRef.current.lang = selectedLanguage;
        }

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          let currentTranscript = "";
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscription(currentTranscript);
        };

        recognitionRef.current.onend = () => {
          if (isListening) {
            recognitionRef.current?.start();
          } else {
            setIsListening(false);
          }
        };

        recognitionRef.current.start();
      }
    }
  }, [selectedLanguage, isListening]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const restartListening = useCallback(async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      await new Promise((resolve) => setTimeout(resolve, 200));
      setTranscription("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, []);

  const setupLanguageSetting = useCallback(async (selectedLanguage: string) => {
    setSelectedLanguage(selectedLanguage);
    if (recognitionRef.current) {
      recognitionRef.current.lang = selectedLanguage;
      recognitionRef.current.stop();
      await new Promise((resolve) => setTimeout(resolve, 200));
      setTranscription("");
      if (isListening) {
        recognitionRef.current.start();
        setIsListening(true);
      }
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <TranscriptionContext.Provider
      value={{
        transcription,
        setTranscription,
        isListening,
        startListening,
        stopListening,
        restartListening,
        toggleListening,
        selectedLanguage,
        setSelectedLanguage,
        setupLanguageSetting,
      }}
    >
      {children}
    </TranscriptionContext.Provider>
  );
};

export const useTranscription = () => {
  const context = useContext(TranscriptionContext);
  if (context === undefined) {
    throw new Error(
      "useTranscription must be used within a TranscriptionProvider"
    );
  }
  return context;
};
