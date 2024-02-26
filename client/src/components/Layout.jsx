import { Outlet } from "react-router-dom";
import Header from "./Header";

const Layout = () => {
  return (
    <div className="w-[100vw] h-[100vh]">
      <Header />
      <Outlet />
    </div>
  );
};

export default Layout;
