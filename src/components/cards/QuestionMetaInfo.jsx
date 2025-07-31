import React from "react";

function QuestionMetaInfo({ q, onDelete, timeAgo }) {
    return (
        <>
            {/* Image Preview */}
            {q.imageUrl && (
                <a href={q.imageUrl} target="_blank" rel="noopener noreferrer" className="block">
                    <img
                        src={q.imageUrl}
                        alt="Captured"
                        className="w-full max-h-64 object-contain object-center cursor-pointer rounded"
                    />
                </a>
            )}

            {/* ID and Delete */}
            <div className="flex w-full justify-between items-center mt-2">
                <div onClick={(e) => e.stopPropagation()} className="text-white text-xs">
                    <p>{q._id}</p>
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={() => onDelete(q._id)}
                        className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded px-3 py-1"
                    >
                        삭제
                    </button>
                </div>
            </div>

            {/* User Info */}
            <div className="bg-gray-700 text-xs text-white space-y-1 p-3 rounded mt-3">
                {q.userId ? (
                    <div className="bg-gray-700 rounded-md text-xs text-white space-y-1 w-full">
                        <div className="flex flex-col w-full space-y-1">
                            <div className="flex items-center gap-2">
                                <span
                                    className={`px-1.5 py-0.5 rounded text-xs font-mono ${q.userId.role === "admin"
                                            ? "bg-indigo-300 text-indigo-900"
                                            : "bg-gray-600 text-gray-200"
                                        }`}
                                    title="Role"
                                >
                                    {q.userId.role?.toUpperCase() || "USER"}
                                </span>
                                <span className="font-semibold">{q.userId.name || "Unnamed User"}</span>
                            </div>

                            <div className="text-xs text-gray-400 font-mono">uId: {q.userId._id}</div>
                            <div className="text-xs text-gray-400 font-mono">guestId: {q.guestUUID}</div>

                            <div className="flex flex-wrap gap-2 text-xs text-gray-300 truncate">
                                <span
                                    className="cursor-pointer underline decoration-dotted truncate"
                                    title="Click to copy email"
                                    onClick={() => q.userId.email && navigator.clipboard.writeText(q.userId.email)}
                                >
                                    {q.userId.email || "No email"}
                                </span>

                                <span>∙</span>

                                <span
                                    className="font-mono cursor-pointer underline decoration-dotted truncate"
                                    title="Click to copy referral ID"
                                    onClick={() =>
                                        q.userId.referralId && navigator.clipboard.writeText(q.userId.referralId)
                                    }
                                >
                                    초대코드: {q.userId.referralId || "-"}
                                </span>
                            </div>

                            <div className="text-xs text-gray-400 mt-1 truncate max-w-xs font-mono">
                                가입일:{" "}
                                {q.userId.createdAt ? new Date(q.userId.createdAt).toLocaleDateString() : "-"}{" "}
                                ({timeAgo(q.userId.createdAt)})
                            </div>

                            <div className="text-xs mt-1 text-gray-400 truncate max-w-xs font-mono">
                                로그인 방식: {q.userId.provider || "-"}
                            </div>

                            <div className="mt-1 text-xs text-gray-400 truncate max-w-xs font-mono">
                                <span className="min-w-[60px]">기종: </span>
                                <span>
                                    {q.metadata?.userAgent
                                        ? q.metadata.userAgent.includes("CFNetwork") && q.metadata.userAgent.includes("Darwin")
                                            ? " Apple iOS App"
                                            : q.metadata.userAgent
                                        : "정보 없음"}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-1 text-xs border-t pt-1 border-gray-500 border-dashed">
                                <span
                                    className={`inline-block px-2 py-0.5 rounded-full font-mono ${{
                                            active: "bg-green-200 text-green-800",
                                            canceled: "bg-yellow-200 text-yellow-800",
                                            expired: "bg-red-200 text-red-800",
                                            none: "bg-gray-300 text-gray-700",
                                        }[q.userId.subscriptionStatus || "none"]
                                        }`}
                                    title="Subscription status"
                                >
                                    구독: {q.userId.subscriptionStatus || "none"}
                                </span>

                                <span className="text-gray-300 font-mono">타입: {q.userId.subscriptionType || "-"}</span>

                                <span className="text-gray-300 font-mono truncate max-w-xs">
                                    만료:{" "}
                                    {q.userId.subscriptionExpiresAt
                                        ? new Date(q.userId.subscriptionExpiresAt).toLocaleDateString()
                                        : "-"}
                                </span>
                            </div>
                        </div>
                    </div>
                ) : q.metadata?.userInfo ? (
                    <div className="bg-gray-700 rounded-md text-xs text-white space-y-2">
                        <span className="min-w-[60px]">정보: </span>
                        <span>{q.metadata.userInfo === "Unauthenticated user" ? "비회원" : q.metadata.userInfo} </span>
                        <div className="text-xs text-gray-400 font-mono">guestId: {q.guestUUID}</div>
                        <div className="mt-1 text-xs text-gray-400 truncate max-w-xs font-mono">
                            <span className="min-w-[60px]">기종: </span>
                            <span>
                                {q.metadata.userAgent.includes("CFNetwork") && q.metadata.userAgent.includes("Darwin")
                                    ? " Apple iOS App"
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
