import { Link } from "react-router";
import UserSettingsButton from "./UserSettingsButton";
import logo from "../assets/logo.png";

const NavBar = ({ user, setUser, title, value1, value2 }) => {
  return (
    <nav className="w-full flex-shrink-0 md:flex justify-center h-14 z-30 items-center px-3 md:px-4 bg-white sticky top-0">
      <div className="flex w-full h-full justify-between items-center space-x-2">
        <div className="flex space-x-6 items-center">
          <Link to="/" className="flex-shrink-0 font-semibold">
            <img src={logo} alt="" className="w-12 h-12" />
          </Link>
        </div>

        <div className="flex flex-col items-center">
          <p className="font-semibold text-center w-full">{title}</p>
          <div className="flex space-x-1">
            {value1 && <p className="text-xs text-indigo-500 flex-shrink-0">{value1}</p>}
            {value2 && <p className="text-xs text-indigo-500 flex-shrink-0">·</p>}
            {value2 && <p className="text-xs text-indigo-500 flex-shrink-0">{value2}</p>}
          </div>
        </div>

        <div className="flex flex-shrink-0 space-x-6 items-center">
          {user && <UserSettingsButton user={user} setUser={setUser} />}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
