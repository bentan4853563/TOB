import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useSelector } from "react-redux";

import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import Loading from "./components/Loading";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Layout from "./components/Layout";
import DisplayTable from "./pages/DisplayTable";
import NewDocument from "./pages/NewDocument";
import EditDocument from "./pages/EditDocument";
import ViewDocuments from "./pages/ViewDocuments";

const ProtectedRoute = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

function App() {
  const { loading } = useSelector((state) => state.loading);

  return (
    <>
      <Loading loading={loading} />
      <ToastContainer />
      <Router>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/tb" element={<Layout />}>
              <Route path="home" element={<Home />} />
              <Route path="dbtable" element={<DisplayTable />} />
              <Route path="new" element={<NewDocument />} />
              <Route path="edit" element={<EditDocument />} />
              <Route path="view" element={<ViewDocuments />} />
            </Route>
          </Route>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
