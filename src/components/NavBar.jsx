import { Link, useLocation } from "react-router";
import { TypeAnimation } from "react-type-animation";
import UserSettingsButton from "./UserSettingsButton";
import clsx from "clsx";

const NavBar = ({ user, setUser }) => {
  const location = useLocation();

  const MenuButton = ({ title, id }) => {
    const path = `/admin/${id}`;
    const isActive = location.pathname === path;

    return (
      <Link to={path}>
        <button
          className={clsx("px-3 py-1.5 rounded-lg text-sm", isActive ? "underline font-semibold" : "bg-white")}
        >
          {title}
        </button>
      </Link>
    );
  };

  return (
    <nav className="w-full flex-shrink-0 md:flex justify-center z-30 py-3 px-3 md:px-4 bg-white">
      <div className="flex w-full h-full justify-between space-x-2">
        <div className="flex space-x-6 items-center">
          <Link to="/" className="flex-shrink-0 font-bold">
            <div className="w-24">
              <TypeAnimation
                sequence={["Raghut", 5000, "raghut", 5000, "rag", 1000]}
                repeat={Infinity}
                speed={20}
                style={{ fontSize: "1.3rem" }}
              />
            </div>
          </Link>
        </div>

        {user && (
          <div className="flex space-x-2">
            <MenuButton id="devices" title="Devices" />
            <MenuButton id="frames" title="Frames" />
            <MenuButton id="register" title="Register" />
          </div>
        )}

        <div className="flex flex-shrink-0 space-x-6 items-center">
          {user ? (
            <UserSettingsButton user={user} setUser={setUser} />
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
