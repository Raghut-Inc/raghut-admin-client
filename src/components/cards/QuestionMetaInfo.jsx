import React from "react";

function QuestionMetaInfo({ q, timeAgo, setFilter }) {
    // Handler to apply filter on userId or guestUUID
    const handleFilterClick = (e) => {
        e.stopPropagation(); // prevent event bubbling if inside clickable card

        if (q.userId?._id) {
            setFilter({ userId: q.userId._id });
        } else if (q.guestUUID) {
            setFilter({ guestUUID: q.guestUUID });
        }
    };

    return (
        <>


            {/* User Info */}
            <div
                className="bg-gray-700 hover:bg-gray-600 transition text-xs text-white space-y-1 p-3 cursor-pointer"
                onClick={handleFilterClick}
                title="Click here to filter by this user or guest"
            >
                {q.userId ? (
                    <div className="rounded-md text-xs text-white space-y-1 w-full">
                        <div className="flex flex-col w-full space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-base">{q.userId.preferredLanguage === "ko" ? "🇰🇷" : "🇺🇸"}</span>
                                <span className="font-semibold">{q.userId.name || "Unnamed User"}</span>
                                <div className="text-xs text-gray-400 font-mono">@{q.userId.username}</div>
                            </div>

                            <div className="text-xs text-gray-400 font-mono">{q.userId._id}</div>

                            <div className="text-xs text-gray-400 mt-1 truncate max-w-xs font-mono">
                                가입일: {q.userId.createdAt ? new Date(q.userId.createdAt).toLocaleDateString() : "-"} (
                                {timeAgo(q.userId.createdAt)}) {q.userId.provider || "UNKNOWN"}
                            </div>

                            <div className="mt-1 text-xs text-gray-400 truncate max-w-xs font-mono">
                                <span className="min-w-[60px]">기종: </span>
                                <span>
                                    {q.metadata.userAgent.includes("CFNetwork") && q.metadata.userAgent.includes("Darwin")
                                        ? " Apple iOS App"
                                        : q.metadata.userAgent.includes("okhttp")
                                            ? "🤖 Android App"
                                            : q.metadata.userAgent}
                                </span>
                            </div>
                        </div>
                    </div>
                ) : q.metadata?.userInfo ? (
                    <div className="bg-gray-700 rounded-md text-xs text-white space-y-2">
                        <span>{q.metadata.userInfo === "Unauthenticated user" ? "비회원" : q.metadata.userInfo} </span>
                        <div className="text-xs text-gray-400 font-mono">guestId: {q.guestUUID}</div>
                        <div className="mt-1 text-xs text-gray-400 truncate max-w-xs font-mono">
                            <span className="min-w-[60px]">기종: </span>
                            <span>
                                {q.metadata.userAgent.includes("CFNetwork") && q.metadata.userAgent.includes("Darwin")
                                    ? " Apple iOS App"
                                    : q.metadata.userAgent.includes("okhttp")
                                        ? "🤖 Android App"
                                        : q.metadata.userAgent}
                            </span>
                        </div>
                    </div>
                ) : null}
            </div>
        </>
    );
}

export default QuestionMetaInfo;
