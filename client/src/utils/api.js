import axios from "axios";

// Create an instance of axios

const api = axios.create({
  baseURL: "https://8555-88-99-162-157.ngrok-free.app/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
