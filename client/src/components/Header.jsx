import { useDispatch, useSelector } from "react-redux";
import { Menu, MenuItem, MenuButton } from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/slide.css";

import { LuUserX2 } from "react-icons/lu";
import { LuUserCheck } from "react-icons/lu";
import { Link } from "react-router-dom";
import { logout } from "../redux/reducers/authSlice";

const Header = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="w-full h-16 flex items-center justify-between px-24">
      <div className="flex gap-8">
        <Link
          to="/tb/dbtable"
          className="text-xl font-sans text-black hover:text-sky-900"
        >
          <img
            className="mx-auto w-24"
            src="https://tecdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/lotus.webp"
            alt="logo"
          />
        </Link>
        {/* <Link
          to="/tb/createtable"
          className="text-xl font-sans text-black hover:text-sky-900"
        >
          CreateableTable
        </Link> */}
      </div>
      <Menu
        menuButton={
          <MenuButton className="h-10 rounded-md border border-gray-200 flex justify-center items-center focus:outline-none">
            {isAuthenticated ? (
              <LuUserCheck className="w-6 h-6" />
            ) : (
              <LuUserX2 className="w-6 h-6" />
            )}
          </MenuButton>
        }
        transition
        gap={10}
        align="end"
      >
        <MenuItem onClick={handleLogout} className="flex justify-center">
          Logout
        </MenuItem>
        <MenuItem className="flex justify-center">Profile</MenuItem>
      </Menu>
      {/* <div
        className=" cursor-pointer relative border border-sky-300 rounded-full p-2"
        onClick={() => setIsLoginModalOpen(!isLoginModalOpen)}
      >

        {isAuthenticated ? (
          <LuUserCheck className="w-6 h-6" />
        ) : (
          <LuUserX2 className="w-6 h-6" />
        )}

        {isLoginModalOpen && (
          <div className="w-32 h-24 absolute top-10 -left-8 flex flex-col items-center justify-evenly rounded-sm shadow-sm shadow-gray-500">
            <p
              className="w-full text-center cursor-pointer py-2 text-lg hover:bg-gray-200"
              onClick={handleLogout}
            >
              Logout
            </p>
            <p className="w-full text-center cursor-pointer py-2 text-lg hover:bg-gray-200">
              Profile
            </p>
          </div>
        )}
      </div> */}
    </div>
  );
};

export default Header;
