import { useState } from "react";
import { Link, useLocation } from "react-router";
import {
    FaBars,
    FaUserLarge,
    FaCubesStacked,
    FaDatabase,
    FaClock,
    FaDollarSign,
    FaTicketSimple,
} from "react-icons/fa6";
import { FaAd, FaTimes } from "react-icons/fa";
import { MdFileUpload } from "react-icons/md";
import { IoIosImage } from "react-icons/io";
import { IoChatbubbleSharp } from "react-icons/io5";
import { RiKakaoTalkFill } from "react-icons/ri";
import { SiPosthog } from "react-icons/si"; // ✅ add
import clsx from "clsx";
import UserSettingsButton from "./UserSettingsButton";
import { LucideTextCursorInput } from "lucide-react";

const SideMenu = ({ user, setUser }) => {
    const [open, setOpen] = useState(false);
    const location = useLocation();

    const MenuItem = ({ to, href, icon, label, external = false }) => {
        const isActive = to && location.pathname.includes(to);
        const baseClasses =
            "flex items-center gap-3 px-4 py-3 rounded-md transition-colors text-sm";

        if (external) {
            return (
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className={`${baseClasses} text-gray-500 hover:bg-gray-100`}
                >
                    {icon}
                    <span className="font-medium">{label}</span>
                </a>
            );
        }

        return (
            <Link
                to={to}
                onClick={() => setOpen(false)}
                className={clsx(
                    baseClasses,
                    isActive
                        ? "bg-indigo-600 text-white"
                        : "text-gray-500 hover:bg-gray-100"
                )}
            >
                {icon}
                <span className="font-medium">{label}</span>
            </Link>
        );
    };

    return (
        <>
            {/* Floating Hamburger Button */}
            <button
                onClick={() => setOpen(!open)}
                className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-white/70 backdrop-blur-xl shadow-xl border-t border-gray-200 hover:bg-white transition text-gray-700"
            >
                {open ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
            </button>

            {/* Overlay */}
            {open && (
                <div
                    onClick={() => setOpen(false)}
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                />
            )}

            {/* Side Drawer */}
            <aside
                className={clsx(
                    "fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out",
                    open ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Scrollable Content */}
                <div className="flex flex-col mt-14 px-2 overflow-y-auto h-[calc(100vh-3.5rem)] pb-6">
                    {user && (
                        <>
                            {/* Dashboard Section */}
                            <div className="text-xs uppercase font-semibold text-gray-400 px-4 mb-1">
                                Dashboard
                            </div>

                            {/* ✅ PostHog link at top */}
                            <MenuItem
                                href="https://us.posthog.com/project/267472/dashboard/890768"
                                icon={<SiPosthog className="w-4 h-4" />}
                                label="PostHog"
                                external
                            />

                            <MenuItem
                                to="/admin/uploads"
                                icon={<IoIosImage className="w-4 h-4" />}
                                label="찰칵앱 업로드"
                            />
                            <MenuItem
                                to="/admin/kakao"
                                icon={<RiKakaoTalkFill className="w-4 h-4" />}
                                label="카톡 챗봇 업로드"
                            />
                            <MenuItem
                                to="/admin/followup"
                                icon={<IoChatbubbleSharp className="w-4 h-4" />}
                                label="추가 질문"
                            />
                            {/* Users */}
                            <div className="text-xs uppercase font-semibold text-gray-400 px-4 mt-8 mb-1">
                                유저
                            </div>
                            <MenuItem
                                to="/admin/users/all"
                                icon={<FaUserLarge className="w-4 h-4" />}
                                label="모든 유저"
                            />
                            <MenuItem
                                to="/admin/users/subscribed-users"
                                icon={<FaDollarSign className="w-4 h-4" />}
                                label="구독 유저"
                            />
                            <MenuItem
                                to="/admin/users/daily-active-users"
                                icon={<FaClock className="w-4 h-4" />}
                                label="최근 업로드 유저"
                            />
                            <MenuItem
                                to="/admin/users/dashboard"
                                icon={<LucideTextCursorInput className="w-4 h-4" />}
                                label="유저 기입 상태"
                            />
                            <MenuItem
                                to="/admin/grant"
                                icon={<FaTicketSimple className="w-4 h-4" />}
                                label="한달권 증정"
                            />
                            {/* Ads Tools */}
                            <div className="text-xs uppercase font-semibold text-gray-400 px-4 mt-8 mb-1">
                                Ads Tools
                            </div>
                            <MenuItem
                                to="/admin/ads"
                                icon={<FaAd className="w-4 h-4" />}
                                label="Ads"
                            />
                            {/* Dev Tools */}
                            <div className="text-xs uppercase font-semibold text-gray-400 px-4 mt-8 mb-1">
                                Dev Tools
                            </div>
                            <MenuItem
                                href="https://api.chalcack.com/admin/queues/"
                                icon={<FaCubesStacked className="w-4 h-4" />}
                                label="Queues"
                                external
                            />
                            <MenuItem
                                to="/admin/db-stats"
                                icon={<FaDatabase className="w-4 h-4" />}
                                label="DB Stats"
                            />
                            <MenuItem
                                to="/admin/dev"
                                icon={<MdFileUpload className="w-4 h-4" />}
                                label="Test upload"
                            />

                            {/* Account Section */}
                            <div className="text-xs uppercase font-semibold text-gray-400 px-4 mt-8 mb-1">
                                Account
                            </div>
                            <UserSettingsButton user={user} setUser={setUser} />
                        </>
                    )}
                </div>
            </aside>
        </>
    );
};

export default SideMenu;
