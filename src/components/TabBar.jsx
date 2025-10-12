import { Link, useLocation } from "react-router";
import clsx from "clsx";
import { IoChatbubbleSharp } from "react-icons/io5";
import { FaUserLarge } from "react-icons/fa6";
import { SiGoogleanalytics } from "react-icons/si";
import { IoIosImage } from "react-icons/io";

const TabBar = ({ user, setUser }) => {
    const location = useLocation();

    const MenuButton = ({ icon, id }) => {
        const path = `/admin/${id}`;
        const isActive = location.pathname === path;

        return (
            <Link to={path} className="w-full flex items-center justify-center">
                <button
                    className={clsx("flex items-center justify-center h-14 w-full", isActive ? "font-semibold bg-indigo-600 text-white" : "text-gray-500")}
                >
                    {icon}
                </button>
            </Link>
        );
    };

    return (
        <nav className="flex-shrink-0 justify-center z-30 w-12 items-center overflow-hidden
    fixed bottom-2 right-2 shadow-xl border-t rounded-full
    bg-white/60 backdrop-blur-xl">
            {user && (
                <div className="flex flex-col flex-shrink-0 items-center justify-evenly">
                    <MenuButton id="analytics" icon={<SiGoogleanalytics className="w-5 h-5" />} />
                    <MenuButton id="uploads" icon={<IoIosImage className="w-6 h-6" />} />
                    <MenuButton id="user" icon={<FaUserLarge className="w-5 h-5" />} />
                    <MenuButton id="chat" icon={<IoChatbubbleSharp className="w-5 h-5" />} />
                </div>
            )}
        </nav>

    );
};

export default TabBar;
