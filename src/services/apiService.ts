const heygenApiUrl = process.env.REACT_APP_HEYGEN_API_URL;
const heygenApiKey = process.env.REACT_APP_HEYGEN_API_KEY;

export const fetchAccessToken = async (): Promise<string> => {
  if (!heygenApiUrl || heygenApiUrl === 'undefined') {
    console.error("REACT_APP_HEYGEN_API_URL is not defined");
    return "";
  }

  const response = await fetch(`${heygenApiUrl}/sessions/token`, {
    method: "POST",
    headers: {
      "x-api-key": heygenApiKey || "",
      "Content-Type": "application/json",
      "accept": "application/json",
    },
    body: JSON.stringify({
      mode: "FULL",
      avatar_id: process.env.REACT_APP_HEYGEN_AVATAR_NAME,
      avatar_persona: {
        voice_id: process.env.REACT_APP_HEYGEN_VOICE_ID || "864a26b8-bfba-4435-9cc5-1dd593de5ca7"
      },
      is_sandbox: false,
      quality: "high"
    })
  });

  const { data } = await response.json();
  return data?.session_token || "";
};