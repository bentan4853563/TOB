import App from "./App.jsx";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "../src/redux/store.js";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
	<Provider store={store}>
		<App />
	</Provider>
);
