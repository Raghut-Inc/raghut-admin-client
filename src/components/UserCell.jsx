import React, { useState } from "react";
import { calcAge, timeAgo } from "../utils/timeAgo";
import { FaSearch } from "react-icons/fa";

const UserCell = ({ user, q, stats = {}, compact: defaultCompact = false, onFilter, hideToggle = false }) => {
    const [compact, setCompact] = useState(defaultCompact);
    const [updatingType, setUpdatingType] = useState(false);
    const [updateMsg, setUpdateMsg] = useState("");

    const u = user || q?.userId;

    const handleFilter = (e) => {
        e.stopPropagation();
        if (u?._id && onFilter) onFilter({ userId: u._id });
    };

    const formatDeviceLabel = (ua = "") => {
        if (!ua) return "unknown";
        if (ua.includes("CFNetwork") && ua.includes("Darwin")) return " iOS App";
        if (ua.includes("okhttp")) return "🤖 Android App";
        if (ua.includes("Chrome")) return "💻 Web";
        return ua;
    };

    const handleUserTypeChange = async (newType) => {
        setUpdatingType(true);
        setUpdateMsg("");

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/admin/users/${u._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userType: newType }),
                credentials: "include",
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Update failed");

            u.userType = newType;
            setUpdateMsg("✅ 변경 완료");
        } catch (err) {
            console.error("❌ Failed to update userType:", err);
            setUpdateMsg("⚠️ 오류 발생");
        } finally {
            setUpdatingType(false);
            setTimeout(() => setUpdateMsg(""), 2000);
        }
    };

    const onSelectChange = (e) => {
        e.stopPropagation();
        const newType = e.target.value;
        if (newType) handleUserTypeChange(newType);
    };

    const onResetClick = (e) => {
        e.stopPropagation();
        handleUserTypeChange("other");
    };

    // 🧩 toggle between compact and full
    const toggleCollapse = (e) => {
        e.stopPropagation();
        setCompact(!compact);
    };

    // ===================================================================
    // COMPACT VIEW
    // ===================================================================
    if (compact) {
        return (
            <div
                onClick={toggleCollapse}
                className="flex items-center justify-between text-xs bg-white/5 hover:bg-white/10 transition cursor-pointer h-10"
            >
                {/* LEFT: Name + Username */}
                <div className="flex items-center gap-2 min-w-0 px-2">
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
                                <span className="text-gray-400 font-normal text-xs"> @{u.username}</span>
                            </p>
                            {u?.birthday && (
                                <div className="flex items-center gap-2 text-[11px] text-gray-300">
                                    <span>
                                        🎂 {new Date(u.birthday).getFullYear()}년생 ({calcAge(u.birthday)}세)
                                    </span>
                                    {u?.zodiacAnimal && <span>{u.zodiacAnimal}</span>}
                                </div>
                            )}
                        </div>
                        {u?.revenuecatUserId && <p className="text-gray-400">rc: {u.revenuecatUserId}</p>}
                    </div>
                </div>

                {/* RIGHT: Stats + Times + Toggle */}
                <div className="flex items-center gap-3 text-right font-mono text-[11px] text-gray-200">
                    <div className="flex flex-col items-end text-[10px] text-gray-400">
                        {stats?.lastAt && <span>마지막 {timeAgo(stats.lastAt)}</span>}
                        {u?.createdAt && <span>가입 {timeAgo(u.createdAt)}</span>}
                    </div>

                    {hideToggle && (
                        <>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] text-gray-400">U/Q</span>
                                <span className="font-semibold text-white">
                                    {stats?.todayUploads || 0} / {stats?.todayQuestions || 0}
                                </span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] text-gray-400">TU/TQ</span>
                                <span className="font-semibold text-white">
                                    {stats?.totalUploads || 0} / {stats?.totalQuestions || 0}
                                </span>
                            </div>
                        </>
                    )}

                    {!hideToggle && (
                        <button
                            onClick={handleFilter}
                            className="h-10 w-9 text-[10px] bg-gray-600 text-white hover:bg-gray-600 flex-shrink-0 flex items-center justify-center"
                        >
                            <FaSearch />
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // ===================================================================
    // FULL CARD VIEW
    // ===================================================================
    return (
        <div
            onClick={toggleCollapse}
            className="transition text-xs text-white space-y-1 cursor-pointer bg-white/5 hover:bg-white/10"
        >
            {/* ---- Header ---- */}
            <div className="flex items-center gap-2 min-w-0 px-2 h-10">
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
                        </p>
                        {u?.birthday && (
                            <div className="flex items-center gap-2 text-[11px] text-gray-300">
                                <span>
                                    🎂 {new Date(u.birthday).getFullYear()}년생 ({calcAge(u.birthday)}세)
                                </span>
                                {u?.zodiacAnimal && <span>{u.zodiacAnimal}</span>}
                            </div>
                        )}
                    </div>

                    {u?.username && <p className="text-gray-400">@{u.username}</p>}
                </div>
            </div>

            {/* ---- TAGS ---- */}
            <div className="flex flex-wrap gap-1.5 mt-2 items-center p-1">
                {stats?.totalUploads >= 2 && (
                    <span className="inline-flex items-center gap-1 px-2 py-[2px] text-[10px] font-semibold rounded-lg bg-green-500/80 text-white shadow-sm">
                        <span className="text-xs">📸</span>업로드 2번+
                    </span>
                )}
                {stats?.activeDays >= 2 && (
                    <span className="inline-flex items-center gap-1 px-2 py-[2px] text-[10px] font-semibold rounded-lg bg-blue-500/80 text-white shadow-sm">
                        <span className="text-xs">📅</span>이용 2일+
                    </span>
                )}
                {stats?.totalUploads === 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-[2px] text-[10px] font-semibold rounded-lg bg-red-500/80 text-white shadow-sm">
                        X 사용안해봄
                    </span>
                )}

                {u?.userType !== "other" && (
                    <>
                        <span
                            className={`inline-flex items-center gap-1 px-2 py-[2px] text-[10px] font-semibold rounded-lg shadow-sm text-white 
                                ${u?.userType === "study"
                                    ? "bg-indigo-500/80"
                                    : u?.userType === "homework"
                                        ? "bg-yellow-500/80"
                                        : u?.userType === "half"
                                            ? "bg-indigo-500/80"
                                            : "bg-gray-500/80"
                                }`}
                        >
                            <span className="text-xs">
                                {u?.userType === "study"
                                    ? "📖"
                                    : u?.userType === "homework"
                                        ? "📝"
                                        : u?.userType === "half"
                                            ? "🌗"
                                            : "🎯"}
                            </span>
                            {u?.userType === "study"
                                ? "공부러"
                                : u?.userType === "homework"
                                    ? "숙제러"
                                    : u?.userType === "half"
                                        ? "반반"
                                        : "기타"}
                        </span>
                        <button
                            onClick={onResetClick}
                            disabled={updatingType}
                            className="ml-1 px-1.5 py-[1px] text-[9px] rounded-full bg-red-500/20 text-red-500 border border-red-500/10 transition"
                        >
                            X
                        </button>
                    </>
                )}

                {(u?.userType === "other" || !u?.userType) && (
                    <div onClick={(e) => e.stopPropagation()}>
                        <select
                            disabled={updatingType}
                            onChange={onSelectChange}
                            defaultValue=""
                            className="text-[10px] px-2 py-[2px] rounded-lg bg-white/20 text-white font-semibold outline-none cursor-pointer border border-white/10 hover:bg-white/30"
                        >
                            <option value="" disabled>🔧 유저 유형</option>
                            <option value="study">📘 공부러</option>
                            <option value="homework">📚 숙제러</option>
                            <option value="half">🌗 반반</option>
                        </select>
                    </div>
                )}

                {updateMsg && <span className="text-[10px] text-gray-300 ml-1">{updateMsg}</span>}
            </div>

            {/* ---- Devices ---- */}
            {Array.isArray(u?.devices) && u.devices.length > 0 && (
                <div className="bg-white/10 p-2 text-[11px]">
                    {u?.createdAt && (
                        <div className="flex justify-between text-gray-400 font-mono border-b border-white/10">
                            <div className="font-semibold text-gray-300 mb-1">가입일</div>
                            <span>
                                {new Date(u.createdAt).toLocaleDateString()} ({timeAgo(u.createdAt)}) · {u.provider || "UNKNOWN"}
                            </span>
                        </div>
                    )}
                    <div className="font-semibold text-gray-300 mt-2 mb-1">최근 접속 기기</div>
                    {u.devices.map((d, i) => (
                        <div key={i} className="flex flex-col border-white/10 pt-1">
                            <div className="flex justify-between">
                                <span>{formatDeviceLabel(d.userAgent)}</span>
                                <span className="text-gray-400">{timeAgo(d.lastSeenAt)}</span>
                            </div>
                            <div className="text-gray-400 flex justify-between text-[10px]">
                                <span>{d.lastIP || "-"}</span>
                                <span>{d.platform || "unknown"}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ---- Subscription Info ---- */}
            {(u?.revenuecatUserId || u?.subscriptionStatus !== "none") && (
                <div className="bg-white/10 p-2 text-[11px] space-y-1 border-t border-white/10">
                    <div className="flex justify-between">
                        <span className="font-semibold text-gray-300">RevenueCat ID</span>
                        <span className="text-gray-400 font-mono truncate max-w-[180px]">
                            {u.revenuecatUserId || "—"}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-semibold text-gray-300">Status</span>
                        <span
                            className={
                                u.subscriptionStatus === "active"
                                    ? "text-green-400 font-semibold"
                                    : u.subscriptionStatus === "canceled"
                                        ? "text-yellow-400"
                                        : u.subscriptionStatus === "expired"
                                            ? "text-red-400"
                                            : "text-gray-400"
                            }
                        >
                            {u.subscriptionStatus || "none"}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-semibold text-gray-300">Plan</span>
                        <span className="text-gray-300">{u.subscriptionType || "—"}</span>
                    </div>
                    {u.subscriptionExpiresAt && (
                        <div className="flex justify-between">
                            <span className="font-semibold text-gray-300">Expires</span>
                            <span className="text-gray-300">
                                {new Date(u.subscriptionExpiresAt).toLocaleDateString("ko-KR", {
                                    month: "short",
                                    day: "numeric",
                                })}{" "}
                                ({timeAgo(u.subscriptionExpiresAt)})
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* ---- Upload Stats ---- */}
            {(stats?.totalUploads || stats?.todayUploads) ? (
                <div className="bg-white/5 p-2 space-y-1 text-[11px]">
                    <div className="flex justify-between">
                        <span>오늘 업로드 / 문제</span>
                        <span className="font-semibold text-white">
                            {stats.todayUploads || 0} / {stats.todayQuestions || 0}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>총 업로드 / 문제</span>
                        <span className="font-semibold text-white">
                            {stats.totalUploads || 0} / {stats.totalQuestions || 0}
                        </span>
                    </div>
                    {stats?.firstAt && (
                        <div className="flex justify-between">
                            <span>첫 업로드 / 마지막</span>
                            <span className="text-gray-300">
                                {timeAgo(stats.firstAt)} / {timeAgo(stats.lastAt)}
                            </span>
                        </div>
                    )}
                    {stats?.activeDays ? (
                        <div className="flex justify-between">
                            <span>활동일 수</span>
                            <span className="font-semibold text-white">{stats.activeDays}</span>
                        </div>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
};

export default UserCell;
