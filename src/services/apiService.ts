import { HEYGEN_CONFIG } from "../config/apiConfig";

export const fetchAccessToken = async (): Promise<string> => {
  const response = await fetch(`${HEYGEN_CONFIG.API_URL}/sessions/token`, {
    method: "POST",
    headers: {
      "x-api-key": HEYGEN_CONFIG.API_KEY,
      "Content-Type": "application/json",
      "accept": "application/json",
    },
    body: JSON.stringify({
      mode: "FULL",
      avatar_id: HEYGEN_CONFIG.AVATAR_NAME,
      avatar_persona: {
        voice_id: HEYGEN_CONFIG.VOICE_ID
      },
      is_sandbox: false,
      quality: "high"
    })
  });

  const { data } = await response.json();
  return data?.session_token || "";
};