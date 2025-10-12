import { Link } from "react-router";
import UserSettingsButton from "./UserSettingsButton";
import logo from "../assets/logo.png";
import { FaDev } from "react-icons/fa6";

const NavBar = ({ user, setUser }) => {
  return (
    <nav className="w-full flex-shrink-0 md:flex justify-center h-12 z-30 items-center px-3 md:px-4 bg-white sticky top-0">
      <div className="flex w-full h-full justify-between items-center space-x-2">
        <div className="flex space-x-6 items-center">
          <Link to="/" className="flex-shrink-0 font-semibold">
            <img src={logo} alt="" className="w-12 h-12" />
          </Link>
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
