import React, { useState } from "react";
import { calcAge, timeAgo } from "../utils/timeAgo";
import { FaSearch } from "react-icons/fa";
import { FiCheck, FiCopy } from "react-icons/fi";
import UserDetail from "./UserDetail";

const UserCell = ({ user, q }) => {
    const [copyMsg, setCopyMsg] = useState("")

    const [showFullInfo, setShowFullInfo] = useState(false);

    const u = user || q?.userId;

    const isSubscriptionActive = (user) => {
        if (!user) return false;

        const { subscriptionExpiresAt } = user;
        if (!subscriptionExpiresAt) return false;

        const now = new Date();
        const expiry = new Date(subscriptionExpiresAt);

        // ✅ Active if not expired yet
        return expiry > now;
    };

    const handleFilter = (e) => {
        e.stopPropagation();

        const revenuecatUserId = u?.revenuecatUserId ?? u?.username;
        if (!revenuecatUserId) return;

        window.open(
            `/admin/search?q=${revenuecatUserId}`,
            "_blank",
            "noopener,noreferrer"
        );
    };

    const handleCopy = async (e) => {
        e.stopPropagation();
        if (!u?.revenuecatUserId) return;
        try {
            await navigator.clipboard.writeText(u.revenuecatUserId);
            setCopyMsg("✅ 복사됨");
            setTimeout(() => setCopyMsg(""), 1500);
        } catch (err) {
            console.error("❌ Copy failed", err);
            setCopyMsg("⚠️ 실패");
            setTimeout(() => setCopyMsg(""), 1500);
        }
    };

    return (
        <>
            <div
                onClick={() => setShowFullInfo(true)}
                className={`${isSubscriptionActive(u) ? "bg-purple-800" : "bg-white/5 hover:bg-white/10"} flex items-center justify-between text-xs transition cursor-pointer h-14`}
            >
                {/* LEFT: Name + Username */}
                <div className="flex items-center gap-2 min-w-0 px-2 overflow-hidden">
                    {u?.profileImageUrl && (
                        <img
                            src={u.profileImageUrl}
                            alt=""
                            className="w-6 h-6 bg-gray-200 rounded-full object-cover flex-shrink-0"
                        />
                    )}
                    <div className="truncate">
                        <div className="flex items-center gap-2">
                            <p className="font-semibold text-white truncate">
                                {!u?.preferredLanguage ? "" : u?.preferredLanguage === "ko" ? "🇰🇷" : "🇺🇸"} {u?.name || "이름없음"}
                                <span className="text-gray-400 font-normal text-xs"> @{u?.username}</span>
                            </p>
                            {u?.birthday && (
                                <div className="flex items-center gap-2 text-[11px] text-gray-300">
                                    <span>
                                        🎂 {new Date(u.birthday).getFullYear()}년생 ({calcAge(u.birthday)}세)
                                    </span>
                                </div>
                            )}
                        </div>
                        {u?.email && <p className="text-gray-400">{u.email}</p>}
                        {u?.revenuecatUserId && <p className="text-gray-400">rc: {u.revenuecatUserId}</p>}
                    </div>
                </div>

                {/* RIGHT: Stats + Times + Toggle */}
                <div className="flex items-center gap-3 text-right font-mono text-[11px] text-gray-200">
                    <div className="flex flex-col items-end text-[10px] text-gray-400 w-16 flex-shrink-0">
                        {u?.createdAt && <span>가입 {timeAgo(u.createdAt)}</span>}
                    </div>

                    <div className="flex divide-x divide-gray-500">
                        <button
                            onClick={handleFilter}
                            className="h-14 w-9 text-[10px] bg-gray-600 text-white hover:bg-gray-600 flex-shrink-0 flex items-center justify-center"
                        >
                            <FaSearch />
                        </button>

                        <button
                            onClick={handleCopy}
                            className="h-14 w-9 text-[10px] bg-gray-600 text-white hover:bg-gray-600 flex-shrink-0 flex items-center justify-center"
                            title="Copy RevenueCat ID"
                        >

                            {copyMsg ? <FiCheck size={12} /> : <FiCopy size={12} />}
                        </button>
                    </div>
                </div>
            </div >

            {
                showFullInfo && (
                    <UserDetail
                        userId={u?._id}
                        onClose={() => setShowFullInfo(false)}
                    />
                )
            }
        </>
    );

};

export default UserCell;
