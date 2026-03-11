// v2.1.0 - Minecraft wallpapers + UI contrast fixes
// Centralized API configuration to support multi-server hopping
const DEFAULT_URL = (import.meta.env.VITE_API_BASE_URL || "https://federated-socialnetw.onrender.com/api");

export const getApiBaseUrl = () => {
  return localStorage.getItem('activeServer') || DEFAULT_URL;
};

// Available servers for the demo
export const SERVERS = [
  { 
    name: "Connect Network", 
    url: "https://federated-socialnetw.onrender.com/api",
    localUrl: "http://localhost:5000/api"
  }
];

export const API_BASE_URL = getApiBaseUrl();
