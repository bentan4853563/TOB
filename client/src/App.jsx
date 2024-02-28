import {
	BrowserRouter as Router,
	Route,
	Routes,
	Navigate,
	Outlet,
} from "react-router-dom";
import { useSelector } from "react-redux";

// Import React toast for Alert
// import "react-toastify/dist/ReactToastify.css";
// import { toast, ToastContainer } from "react-toastify";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NewDocument from "./pages/NewDocument";
import DisplayTable from "./pages/DisplayTable";
import Layout from "./components/Layout";
import Loading from "./components/Loading";
import ViewDocuments from "./pages/ViewDocuments";

const ProtectedRoute = () => {
	const { isAuthenticated } = useSelector((state) => state.auth);
	if (!isAuthenticated) {
		return (
			<Navigate
				to='/'
				replace
			/>
		);
	}
	return <Outlet />;
};

function App() {
	const { loading } = useSelector((state) => state.loading);

	return (
		<>
			<Loading loading={loading} />

			<Router>
				<Routes>
					<Route element={<ProtectedRoute />}>
						<Route
							path='/tb'
							element={<Layout />}
						>
							<Route
								path='dbtable'
								element={<DisplayTable />}
							/>
							<Route
								path='new_or_edit'
								element={<NewDocument />}
							/>
							<Route
								path='view'
								element={<ViewDocuments />}
							/>
						</Route>
					</Route>
					<Route
						path='/'
						element={<Login />}
					/>
					<Route
						path='/register'
						element={<Register />}
					/>
				</Routes>
			</Router>
		</>
	);
}

export default App;
