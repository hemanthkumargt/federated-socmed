// Centralized API configuration to support multi-server hopping
const DEFAULT_URL = (import.meta.env.VITE_API_BASE_URL || "https://federated-socialnetw.onrender.com/api");

export const getApiBaseUrl = () => {
  return localStorage.getItem('activeServer') || DEFAULT_URL;
};

// Available servers for the demo
export const SERVERS = [
  { 
    name: "Food & Tech (Server A)", 
    url: "https://federated-socialnetw.onrender.com/api",
    localUrl: "http://localhost:5000/api"
  },
  { 
    name: "Sports & News (Server B)", 
    url: "https://federated-sports-server.onrender.com/api",
    localUrl: "http://localhost:5001/api"
  }
];

export const API_BASE_URL = getApiBaseUrl();
