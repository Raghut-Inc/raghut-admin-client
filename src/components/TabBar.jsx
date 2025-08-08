import { Link, useLocation } from "react-router";
import clsx from "clsx";

const TabBar = ({ user, setUser }) => {
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
        <nav className="w-full flex-shrink-0 md:flex justify-center z-30 py-3 px-3 md:px-4 bg-white fixed bottom-0 shadow-xl border-t">
            <div className="flex w-full h-full justify-between space-x-2">
                {user && (
                    <div className="flex flex-shrink-0 space-x-6 items-center justify-evenly md:justify-start w-full">
                        <MenuButton id="uploads" title="포스트" />
                        <MenuButton id="analytics" title="분석" />
                        <MenuButton id="user" title="유저" />
                        <MenuButton id="chat" title="챗" />
                        <MenuButton id="dev" title="개발용" />
                    </div>
                )}
            </div>
        </nav>
    );
};

export default TabBar;
