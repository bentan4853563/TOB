import { Outlet } from "react-router-dom";
import Header from "./Header";

const Layout = () => {
  return (
    <div className="w-full min-h-[100vh] bg-gray-100 flex flex-col justify-start font-sans">
      <Header />
      <Outlet />
    </div>
  );
};

export default Layout;
