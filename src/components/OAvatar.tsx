import "../styles/OAvatar.css";
import React, { useEffect, useRef, useState } from "react";
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskMode,
  TaskType,
  VoiceEmotion,
} from "@heygen/streaming-avatar";
import { LiveAvatarSession, SessionEvent, AgentEventsEnum } from "@heygen/liveavatar-web-sdk";
import LoadingOverlay from "./LoadingOverlay";
import { useTranscription } from "../context/TranscriptionContext";
import { isListeningButtonEnabled, isTalkingActive } from "../pages/ChatPage";
import { useVideo } from "../context/VideoContext";



const hygenApiKey = process.env.REACT_APP_HEYGEN_API_KEY;
const hygenApiUrl = process.env.REACT_APP_HEYGEN_API_URL;
const llmApiUrl = process.env.REACT_APP_LLM_API_URL;
const avatarName = process.env.REACT_APP_HEGYGEN_AVATAR_NAME;

const OAvatar: React.FC<{
  isVideoEnabled: boolean;
}> = ({ isVideoEnabled }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  // const [avatar, setAvatar] = useState<StreamingAvatar | null>(null);
  const [lastReadText, setLastReadText] = useState("");
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(false);
  const { stopListening, restartListening } = useTranscription();
  const { avatar, setAvatar, setIsVideoActive } = useVideo();




  useEffect(() => {
    if (isVideoEnabled) {
      initializeAvatarSession();
    } else {
      terminateAvatarSession();
    }
  }, [isVideoEnabled]);

  useEffect(() => {
    console.log("isListeningEnabled", isListeningButtonEnabled.value);

    const onStartTalking = () => {
      setIsVideoActive(true);
      console.log("AVATAR_START_TALKING", isListeningButtonEnabled.value);
      if (isListeningButtonEnabled.value) {
        stopListening();
      }
    };

    const onStopTalking = () => {
      setIsVideoActive(false);
      console.log("AVATAR_STOP_TALKING", isListeningButtonEnabled.value);
      if (isListeningButtonEnabled.value) {
        restartListening();
      }
    };

    if (avatar instanceof StreamingAvatar) {
      avatar.on(StreamingEvents.AVATAR_START_TALKING, onStartTalking);
      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, onStopTalking);
    } else if (avatar instanceof LiveAvatarSession) {
      avatar.on(AgentEventsEnum.AVATAR_SPEAK_STARTED, onStartTalking);
      avatar.on(AgentEventsEnum.AVATAR_SPEAK_ENDED, onStopTalking);
    }

    return () => {
      if (avatar instanceof StreamingAvatar) {
        avatar.off(StreamingEvents.AVATAR_START_TALKING, onStartTalking);
        avatar.off(StreamingEvents.AVATAR_STOP_TALKING, onStopTalking);
      } else if (avatar instanceof LiveAvatarSession) {
        avatar.off(AgentEventsEnum.AVATAR_SPEAK_STARTED, onStartTalking);
        avatar.off(AgentEventsEnum.AVATAR_SPEAK_ENDED, onStopTalking);
      }
    };
  }, [avatar]);

  const fetchAccessToken = async (): Promise<string> => {
    try {
      const response = await fetch(`${hygenApiUrl}/sessions/token`, {
        method: "POST",
        headers: {
          "x-api-key": hygenApiKey || "",
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          mode: "FULL",
          avatar_id: avatarName,
          avatar_persona: {
            voice_id: process.env.REACT_APP_HEYGEN_VOICE_ID || "864a26b8-bfba-4435-9cc5-1dd593de5ca7"
          },
          is_sandbox: false,
          quality: "high"
        })
      });
      const { data } = await response.json();
      return data.session_token;
    } catch (e) {
      setIsLoadingAvatar(false);
      return "";
    }
  };

  const initializeAvatarSession = async () => {
    try {
      setIsLoadingAvatar(true);
      if (avatar) {
        try {
          if (avatar instanceof StreamingAvatar) {
            await avatar.stopAvatar();
          } else {
            await avatar.stop();
          }
        } catch (e) {
          console.warn("Stopping previous avatar failed", e);
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        setAvatar(null);
      }

      const token = await fetchAccessToken();
      if (!token) {
        console.error("HeyGen access token missing; aborting avatar start");
        setIsLoadingAvatar(false);
        return;
      }

      // Using LiveAvatarSession (New SDK)
      const newAvatar = new LiveAvatarSession(token);
      setAvatar(newAvatar);

      // We define a local onStreamReady to avoid race conditions with the 'avatar' state variable
      const onStreamReady = async () => {
        console.log("Stream ready! Attaching...");
        if (videoRef.current) {
          newAvatar.attach(videoRef.current);
        }

        // Add a slight delay to ensure the audio track is fully initialized
        setTimeout(async () => {
          try {
            console.log("Announcing connection...");
            await newAvatar.repeat("estableciendo conexión con el backend...");
          } catch (e) {
            console.warn("Announcement failed", e);
          }
        }, 1000);
      };

      newAvatar.on(SessionEvent.SESSION_STREAM_READY, onStreamReady);
      newAvatar.on(SessionEvent.SESSION_DISCONNECTED, handleStreamDisconnected);

      await newAvatar.start();

      setIsSessionActive(true);
      setIsLoadingAvatar(false);
    } catch (error) {
      console.error("Error initializing avatar session:", error);
      setIsLoadingAvatar(false);
    }
  };

  const handleStreamReady = () => {
    if (avatar instanceof LiveAvatarSession && videoRef.current) {
      avatar.attach(videoRef.current);
    }
  };

  const handleStreamDisconnected = () => {
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsSessionActive(false);
  };

  const terminateAvatarSession = async () => {
    if (avatar) {
      try {
        if (avatar instanceof StreamingAvatar) {
          await avatar.stopAvatar();
        } else if (avatar instanceof LiveAvatarSession) {
          await avatar.stop();
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        setAvatar(null);
        setIsSessionActive(false);
      } catch (error) {
        console.error("Error terminating avatar session:", error);
      }
    }
  };

  const fetchAndReadText = async () => {
    try {
      const response = await fetch(`${llmApiUrl}/get_string`);
      if (!response.ok) throw new Error("Fetch failed");
      const data = await response.json();
      const newText = data.value;

      if (newText && newText !== lastReadText && avatar) {
        setLastReadText(newText);
        if (avatar instanceof StreamingAvatar) {
          await avatar.speak({
            text: newText,
            task_type: TaskType.REPEAT,
            taskMode: TaskMode.SYNC,
          });
        } else if (avatar instanceof LiveAvatarSession) {
          await avatar.repeat(newText);
        }
      }
    } catch (error) {
      console.error("Error fetching text:", error);
      const errorMessage = "Parece que hay un error recuperando el mensaje del back end";
      if (avatar && lastReadText !== errorMessage) {
        setLastReadText(errorMessage);
        if (avatar instanceof StreamingAvatar) {
          await avatar.speak({
            text: errorMessage,
            task_type: TaskType.REPEAT,
            taskMode: TaskMode.SYNC,
          }).catch(console.error);
        } else if (avatar instanceof LiveAvatarSession) {
          await avatar.repeat(errorMessage);
        }
      }
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

  useEffect(() => {
    return () => {
      try {
        if (avatar) {
          if (avatar instanceof StreamingAvatar) {
            avatar.stopAvatar().catch(console.error);
          } else if (avatar instanceof LiveAvatarSession) {
            avatar.stop().catch(console.error);
          }
          setAvatar(null);
          setIsSessionActive(false);
          setIsVideoActive(false);
        }
      } catch (error) {
        console.error("Error stopping avatar:", error);
      }
    };
  }, [avatar]);

  return (

    <LoadingOverlay isLoading={isLoadingAvatar}>
      <div className="avatar-container">
        <video
          ref={videoRef}
          id="avatarVideo"
          className="avatar-video"
          controls={true}
          autoPlay
          muted
          playsInline
        />
      </div>

    </LoadingOverlay>


  );
};

export default OAvatar;
