import axios from "axios";

// Create an instance of axios

const api = axios.create({
	baseURL: "https://b32b-45-126-3-246.ngrok-free.app/api",
	headers: {
		"Content-Type": "application/json",
	},
});

export default api;
