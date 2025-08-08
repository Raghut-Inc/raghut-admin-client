import { Link, useLocation } from "react-router";
import clsx from "clsx";
import { IoChatbubbleSharp } from "react-icons/io5";
import { FaUserLarge } from "react-icons/fa6";
import { SiGoogleanalytics } from "react-icons/si";
import { IoIosImage } from "react-icons/io";
import { FaDev } from "react-icons/fa";

const TabBar = ({ user, setUser }) => {
    const location = useLocation();

    const MenuButton = ({ icon, id }) => {
        const path = `/admin/${id}`;
        const isActive = location.pathname === path;

        return (
            <Link to={path}>
                <button
                    className={clsx("px-3 h-14 rounded-lg", isActive ? "font-semibold text-indigo-600" : "text-gray-500")}
                >
                    {icon}
                </button>
            </Link>
        );
    };

    return (
        <nav className="w-full flex-shrink-0 md:flex justify-center z-30 h-14 items-center md:px-4 bg-white fixed bottom-0 shadow-xl border-t">
            <div className="flex w-full h-14 justify-between space-x-2">
                {user && (
                    <div className="flex flex-shrink-0 space-x-6 items-center justify-evenly md:justify-start w-full h-14">
                        <MenuButton id="uploads" icon={<IoIosImage className="w-6 h-6" />} />
                        <MenuButton id="analytics" icon={<SiGoogleanalytics className="w-5 h-5" />} />
                        <MenuButton id="user" icon={<FaUserLarge className="w-5 h-5" />} />
                        <MenuButton id="chat" icon={<IoChatbubbleSharp className="w-5 h-5" />} />
                        <MenuButton id="dev" icon={<FaDev className="w-5 h-5" />} />
                    </div>
                )}
            </div>
        </nav>
    );
};

export default TabBar;
