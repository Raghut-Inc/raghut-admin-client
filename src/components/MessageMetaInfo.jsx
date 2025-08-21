import React from "react";
import { ArrowRight } from "lucide-react"; // using lucide-react for nice icons (npm install lucide-react)

function MessageMetaInfo({ msg, timeAgo, setFilter }) {
    const handleFilterClick = (e, userId) => {
        e.stopPropagation();
        if (userId) {
            setFilter({ userId });
        }
    };

    return (
        <div className="flex items-center bg-gray-100 p-3 rounded-xl justify-between">
            {/* Sender */}
            {msg.sender && (
                <div
                    className="text-xs space-y-1 cursor-pointer w-2/5 flex-shrink-0"
                    onClick={(e) => handleFilterClick(e, msg.sender.id)}
                    title="Click to filter by this sender"
                >
                    <div className="flex items-center gap-2 w-full">
                        {msg.sender.profileImageUrl ? (
                            <img
                                src={msg.sender.profileImageUrl}
                                alt={msg.sender.name}
                                className="w-5 h-5 rounded-full"
                            />
                        ) : (
                            <div className="w-5 h-5 rounded-full bg-gray-300" />
                        )}
                        <span className="font-semibold line-clamp-1">{msg.sender.name || "Unnamed User"}</span>
                    </div>
                    <div className="text-gray-400">@{msg.sender.username || "-"}</div>
                    <div className="text-gray-400 line-clamp-1">{msg.sender.id}...</div>
                    <div className="text-gray-400">
                        가입일:{" "}{timeAgo(msg.sender.createdAt)}
                    </div>
                </div>
            )}

            {/* Arrow */}
            <ArrowRight className="w-4 h-4 text-gray-500 flex-shrink-0" />

            {/* Recipients */}
            {msg.recipients?.length > 0 && (
                <div className="flex gap-3 w-2/5 flex-shrink-0">
                    {msg.recipients.map((r) => (
                        <div
                            key={r.id}
                            className="text-xs space-y-1 cursor-pointer w-full"
                            onClick={(e) => handleFilterClick(e, r.id)}
                            title="Click to filter by this recipient"
                        >
                            <div className="flex items-center gap-2">
                                {r.profileImageUrl ? (
                                    <img
                                        src={r.profileImageUrl}
                                        alt={r.name}
                                        className="w-5 h-5 rounded-full"
                                    />
                                ) : (
                                    <div className="w-5 h-5 rounded-full bg-gray-300" />
                                )}
                                <span className="font-semibold">{r.name || "Unnamed User"}</span>
                            </div>
                            <div className="text-gray-400">@{r.username || "-"}</div>
                            <div className="text-gray-400 line-clamp-1">{r.id}</div>
                            <div className="text-gray-400">
                                가입일: {timeAgo(r.createdAt)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

    );
}

export default MessageMetaInfo;
