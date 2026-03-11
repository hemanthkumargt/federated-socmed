// detect if we are running locally
const isLocal = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const DEFAULT_URL = isLocal 
  ? "http://localhost:5000/api"
  : (import.meta.env.VITE_API_BASE_URL || "https://federated-socialnetw.onrender.com/api");

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
