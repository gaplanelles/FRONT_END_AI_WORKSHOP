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
