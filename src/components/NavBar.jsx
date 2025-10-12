import { Link } from "react-router";
import UserSettingsButton from "./UserSettingsButton";
import logo from "../assets/logo.png";
import { FaDev } from "react-icons/fa6";

const NavBar = ({ user, setUser, title, value1, value2 }) => {
  return (
    <nav className="w-full flex-shrink-0 md:flex justify-center h-14 z-30 items-center px-3 md:px-4 bg-white sticky top-0">
      <div className="flex w-full h-full justify-between items-center space-x-2">
        <div className="flex space-x-6 items-center">
          <Link to="/" className="flex-shrink-0 font-semibold">
            <img src={logo} alt="" className="w-12 h-12" />
          </Link>

          <div className="flex flex-col items-start">
            <p className="font-semibold w-full">{title}</p>
            <div className="flex space-x-1">
              {value1 && <p className="text-xs text-indigo-500 flex-shrink-0">{value1}</p>}
              {value2 && <p className="text-xs text-indigo-500 flex-shrink-0">·</p>}
              {value2 && <p className="text-xs text-indigo-500 flex-shrink-0">{value2}</p>}
            </div>
          </div>
        </div>



        <div className="flex flex-shrink-0 space-x-6 items-center">
          <Link to={"/admin/dev"} className="w-full flex items-center justify-center">
            <button className="flex items-center justify-center h-14 w-full text-gray-500">
              <FaDev className="w-5 h-5" />
            </button>
          </Link>
          {user && <UserSettingsButton user={user} setUser={setUser} />}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
