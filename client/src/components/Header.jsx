import { useDispatch } from "react-redux";
import { Menu, MenuItem, MenuButton } from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/slide.css";

import { Link } from "react-router-dom";
import { logout } from "../redux/reducers/authSlice";
import logo from "../assets/logo.png";
import userImg from "../assets/user.png";

// import { TbBellRinging } from "react-icons/tb";
import { IoIosArrowDown } from "react-icons/io";

const Header = () => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="w-full min-h-20 h-20 bg-white flex items-center justify-between px-24">
      <div className="flex gap-8">
        <Link
          to="/tb/dbtable"
          className="text-xl font-sans text-black hover:text-sky-900"
        >
          <img className="mx-auto w-24" src={logo} alt="logo" />
        </Link>
      </div>
      <div className="flex justify-center items-center gap-4">
        <Link className="text-lg font-sans text-black" to="/tb/dbtable">
          Home
        </Link>
        <Link className="text-lg font-sans text-black" to="/tb/dbtable">
          Documents
        </Link>
        {/* <TbBellRinging
					size={28}
					className=' hover:text-indigo-500 cursor-pointer'
				/> */}
        <Menu
          menuButton={
            <MenuButton className="h-10 flex justify-center items-center focus:outline-none border-none">
              <div className="flex items-center justify-center cursor-pointer gap-2">
                <img className="w-8" src={userImg} />
                <IoIosArrowDown size={16} />
              </div>
            </MenuButton>
          }
          transition
          gap={8}
          align="end"
        >
          <MenuItem className="flex justify-center">Profile</MenuItem>
          <MenuItem onClick={handleLogout} className="flex justify-center">
            Logout
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
};

export default Header;
