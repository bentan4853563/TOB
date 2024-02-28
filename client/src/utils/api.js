import axios from "axios";

// Create an instance of axios

const api = axios.create({
	baseURL: "http://localhost:5009/api",
	headers: {
		"Content-Type": "application/json",
	},
});

export default api;
