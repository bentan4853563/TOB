import { Outlet } from "react-router-dom";
import Header from "./Header";

const Layout = () => {
  return (
    <div className="w-[100vw] min-h-[100vh] bg-gray-100 flex flex-col justify-start">
      <Header />
      <Outlet />
    </div>
  );
};

export default Layout;
