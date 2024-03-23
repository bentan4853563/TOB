import axios from "axios";

// Create an instance of axios

const api = axios.create({
  baseURL: `${import.meta.env.VITE_NODE_SERVER_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
