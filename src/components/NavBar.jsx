import { Link, useLocation } from "react-router";
import UserSettingsButton from "./UserSettingsButton";
import clsx from "clsx";
import logo from "../assets/logo.png"

const NavBar = ({ user, setUser }) => {
  const location = useLocation();

  const MenuButton = ({ title, id }) => {
    const path = `/admin/${id}`;
    const isActive = location.pathname === path;

    return (
      <Link to={path}>
        <button
          className={clsx("px-3 py-1.5 rounded-lg text-base", isActive ? "font-semibold text-indigo-600" : "text-gray-500")}
        >
          {title}
        </button>
      </Link>
    );
  };

  return (
    <nav className="w-full flex-shrink-0 md:flex justify-center z-30 py-2 px-3 md:px-4 bg-white">
      <div className="flex w-full h-full justify-between space-x-2">
        <div className="flex space-x-6 items-center">
          <Link to="/" className="flex-shrink-0 font-semibold">
            <img src={logo} alt="" className="w-12 h-12" />
          </Link>
        </div>

        <div className="flex flex-shrink-0 space-x-6 items-center">
          {user ? (
            <div className="flex space-x-3">
              <MenuButton id="uploads" title="업로드" />
              <MenuButton id="analytics" title="분석" />
              <MenuButton id="user" title="유저" />
              {/* <MenuButton id="devices" title="Devices" />
            <MenuButton id="register" title="Register" /> */}
              <UserSettingsButton user={user} setUser={setUser} />
            </div>
          ) : (
            <Link to="/login">
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex-shrink-0">
                Sign in
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
