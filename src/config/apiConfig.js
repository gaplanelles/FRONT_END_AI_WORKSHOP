export const HEYGEN_CONFIG = {
  API_URL: process.env.REACT_APP_HEYGEN_API_URL || "https://api.liveavatar.com/v1",
  API_KEY: process.env.REACT_APP_HEYGEN_API_KEY || "688262f0-6d8b-4a53-83e5-fc1875bce08e",
  AVATAR_NAME: process.env.REACT_APP_HEYGEN_AVATAR_NAME || "073b60a9-89a8-45aa-8902-c358f64d2852",
  VOICE_ID: process.env.REACT_APP_HEYGEN_VOICE_ID || "864a26b8-bfba-4435-9cc5-1dd593de5ca7",
};

export const LLM_CONFIG = {
  API_URL: process.env.REACT_APP_LLM_API_URL || "https://80.225.74.219:10001",
};

export const API_ENDPOINTS = {
  ASK: `${LLM_CONFIG.API_URL}/ask`,
  INIT: `${LLM_CONFIG.API_URL}/init`,
  CLEAN_CONVERSATION: `${LLM_CONFIG.API_URL}/clean_conversation`,
  RAG_CONFIG: `${LLM_CONFIG.API_URL}/rag_config`,
  SETUP_RAG_TEMPLATE: `${LLM_CONFIG.API_URL}/setup_rag_template`,
  SETUP_RAG: `${LLM_CONFIG.API_URL}/setup_rag`,
  STRUCTURING_SPEECH: `${LLM_CONFIG.API_URL}/structuring_speech`,
};


