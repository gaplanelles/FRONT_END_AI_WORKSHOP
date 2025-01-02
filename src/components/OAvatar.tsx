import "../styles/OAvatar.css";
import React, { use, useEffect, useRef, useState } from "react";
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskMode,
  TaskType,
} from "@heygen/streaming-avatar";
import LoadingOverlay from "./LoadingOverlay";
import { useTranscription } from "../context/TranscriptionContext";

const hygenApiKey = process.env.REACT_APP_HEYGEN_API_KEY;
const hygenApiUrl = process.env.REACT_APP_HEYGEN_API_URL;
const llmApiUrl = process.env.REACT_APP_LLM_API_URL;
const avatarName = process.env.REACT_APP_HEGYGEN_AVATAR_NAME;

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

const OAvatar: React.FC<{ isVideoEnabled: boolean }> = ({ isVideoEnabled }) => {
  const {startListening, stopListening} = useTranscription();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [avatar, setAvatar] = useState<StreamingAvatar | null>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [lastReadText, setLastReadText] = useState("");
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(false);

  useEffect(() => {
    if (isVideoEnabled) {
      initializeAvatarSession();
    } else {
      terminateAvatarSession();
    }
  }, [isVideoEnabled]);

  const initAvatarTalking = (newAvatar:StreamingAvatar) => {
    newAvatar?.on(StreamingEvents.AVATAR_START_TALKING, () => {
      stopListening();
    });
    newAvatar?.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
      startListening()
    });
  };

  // Speech recognition setup
  const setupSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Speech Recognition API is not supported in this browser");
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = async (event: SpeechRecognitionEvent) => {
      const capturedText = event.results[0][0].transcript;
      console.log("Captured text:", capturedText);

      const payload = {
        conversation: [],
        genModel: "OCI_CommandRplus",
        message: capturedText,
      };

      try {
        await fetch(`${llmApiUrl}/ask`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        console.error("Error calling /ask:", error);
      }

      if (isListening) {
        setTimeout(() => {
          recognition.start();
        }, 3000);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
    };

    return recognition;
  };

  const fetchAccessToken = async (): Promise<string> => {
    try {
      const response = await fetch(`${hygenApiUrl}/streaming.create_token`, {
        method: "POST",
        headers: {
          "x-api-key": hygenApiKey || "",
          "Content-Type": "application/json",
          accept: "application/json",
        },
      });
      const { data } = await response.json();
      return data.token;
    } catch (e) {
      setIsLoadingAvatar(false);
      return "";
    }
  };

  const initializeAvatarSession = async () => {
    try {
      setIsLoadingAvatar(true);
      const token = await fetchAccessToken();
      const newAvatar = new StreamingAvatar({ token });
      setAvatar(newAvatar);
      initAvatarTalking(newAvatar);

      const data = await newAvatar.createStartAvatar({
        quality: AvatarQuality.High,
        avatarName: avatarName || "avatar",
      });

      setSessionData(data);
      setIsSessionActive(true);
      console.log("Session data:", data);

      newAvatar.on(StreamingEvents.STREAM_READY, handleStreamReady);
      newAvatar.on(
        StreamingEvents.STREAM_DISCONNECTED,
        handleStreamDisconnected
      );
      setIsLoadingAvatar(false);
    } catch (error) {
      console.error("Error initializing avatar session:", error);
      setIsLoadingAvatar(false);
    }
  };

  const handleStreamReady = (event: any) => {
    if (event.detail && videoRef.current) {
      videoRef.current.srcObject = event.detail;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch(console.error);
      };
    }
  };

  const handleStreamDisconnected = () => {
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsSessionActive(false);
  };

  const terminateAvatarSession = async () => {
    if (avatar && sessionData) {
      await avatar.stopAvatar();
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setAvatar(null);
      setIsSessionActive(false);
    }
  };

  const handleSpeak = async () => {
    if (avatar && userInput) {
      await avatar.speak({
        text: userInput,
        task_type: TaskType.REPEAT,
      });
      setUserInput("");
    }
  };

  const fetchAndReadText = async () => {
    try {
      const response = await fetch(`${llmApiUrl}/get_string`);
      const data = await response.json();
      const newText = data.value;

      if (newText !== lastReadText && avatar) {
        setLastReadText(newText);
        await avatar.speak({
          text: newText,
          task_type: TaskType.REPEAT,
          taskMode: TaskMode.SYNC,
        });
        console.log("Text Captured");
      }
    } catch (error) {
      console.error("Error fetching text:", error);
    }
  };

  useEffect(() => {
    let pollingInterval: any;
    if (isSessionActive) {
      fetchAndReadText();
      pollingInterval = setInterval(fetchAndReadText, 3000);
    }
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [isSessionActive, avatar, lastReadText]);

  const toggleAudioCapture = () => {
    const recognition = setupSpeechRecognition();
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <LoadingOverlay isLoading={isLoadingAvatar}>
      <div className="avatar-container">
        <video
          ref={videoRef}
          id="avatarVideo"
          className="avatar-video"
          controls={true}
          playsInline
        />
        <div className="controls">
          {/* <button onClick={initializeAvatarSession} disabled={isSessionActive}>
            Start Session
          </button>
          <button onClick={terminateAvatarSession} disabled={!isSessionActive}>
            End Session
          </button> */}
          {/* <button onClick={toggleAudioCapture}>
            {isListening ? "Stop Capture Audio" : "Capture Audio"}
          </button>
          <div className="input-section">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Enter text for avatar to speak"
            />
            <button onClick={handleSpeak}>Speak</button>
          </div> */}
        </div>
      </div>
    </LoadingOverlay>
  );
};

export default OAvatar;
