import React from "react";

function QuestionMetaInfo({ q, onDelete, timeAgo, setFilter }) {
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
            {/* Image Preview */}
            {q.imageUrl && (
                <a
                    href={q.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                    onClick={(e) => e.stopPropagation()}
                >
                    <img
                        src={q.imageUrl}
                        alt="Captured"
                        className="w-full max-h-64 object-contain object-center cursor-pointer rounded"
                    />
                </a>
            )}

            {/* ID and Delete */}
            <div className="flex w-full justify-between items-center mt-2">
                <div
                    className="text-white text-xs cursor-pointer select-text"
                    title="Click to filter by this user or guest"
                >
                    <p>{q._id}</p>
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // prevent filtering on delete click
                            onDelete(q._id);
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded px-3 py-1"
                    >
                        삭제
                    </button>
                </div>
            </div>

            {/* User Info */}
            <div
                className="bg-gray-700 hover:bg-gray-600 transition text-xs text-white space-y-1 p-3 rounded mt-3 cursor-pointer"
                onClick={handleFilterClick}
                title="Click here to filter by this user or guest"
            >
                {q.userId ? (
                    <div className="bg-gray-700 rounded-md text-xs text-white space-y-1 w-full">
                        <div className="flex flex-col w-full space-y-1">
                            <div className="flex items-center gap-2">
                                <span
                                    className={`px-1.5 py-0.5 rounded text-xs font-mono bg-gray-600 text-gray-200`}
                                >
                                    {q.userId.provider || "UNKNOWN"}
                                </span>
                                <span className="font-semibold text-base">{q.userId.preferredLanguage === "ko" ? "🇰🇷" : "🇺🇸"}</span>
                                <span className="font-semibold">{q.userId.name || "Unnamed User"}</span>
                            </div>

                            <div className="text-xs text-gray-400 font-mono">@{q.userId.username}</div>
                            <div className="text-xs text-gray-400 font-mono">{q.userId._id}</div>

                            <div className="flex flex-wrap gap-2 text-xs text-gray-300 truncate">
                                <span
                                    className="cursor-pointer underline decoration-dotted truncate"
                                    title="Click to copy email"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        q.userId.email && navigator.clipboard.writeText(q.userId.email);
                                    }}
                                >
                                    {q.userId.email || "No email"}
                                </span>

                                <span>∙</span>

                                <span
                                    className="font-mono cursor-pointer underline decoration-dotted truncate"
                                    title="Click to copy referral ID"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        q.userId.referralId && navigator.clipboard.writeText(q.userId.referralId);
                                    }}
                                >
                                    초대코드: {q.userId.referralId || "-"}
                                </span>
                            </div>

                            <div className="text-xs text-gray-400 mt-1 truncate max-w-xs font-mono">
                                가입일: {q.userId.createdAt ? new Date(q.userId.createdAt).toLocaleDateString() : "-"} (
                                {timeAgo(q.userId.createdAt)})
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
