import axios from "axios";

// Create an instance of axios

const api = axios.create({
	baseURL: `${import.meta.env.VITE_BACKEND_URL}`,
	headers: {
		"Content-Type": "application/json",
	},
});

export default api;
