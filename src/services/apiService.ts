const hygenApiUrl = process.env.REACT_APP_HYGEN_API_URL;
const hygenApiKey = process.env.REACT_APP_HYGEN_API_KEY;

export const fetchAccessToken = async (): Promise<string> => {
  const response = await fetch(`${hygenApiUrl}/sessions/token`, {
    method: "POST",
    headers: {
      "x-api-key": hygenApiKey || "",
      "Content-Type": "application/json",
      "accept": "application/json",
    },
    body: JSON.stringify({
      mode: "FULL",
      avatar_id: process.env.REACT_APP_HEGYGEN_AVATAR_NAME,
      avatar_persona: {
        voice_id: process.env.REACT_APP_HEYGEN_VOICE_ID || "864a26b8-bfba-4435-9cc5-1dd593de5ca7"
      },
      is_sandbox: false,
      quality: "high"
    })
  });

  const { data } = await response.json();
  return data.session_token;
};