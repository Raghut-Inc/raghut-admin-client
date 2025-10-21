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
        <div className="flex items-center rounded-xl space-x-2">
            {/* Sender */}
            {msg.sender && (
                <div
                    className="text-xs space-y-1 cursor-pointer"
                    onClick={(e) => handleFilterClick(e, msg.sender.id)}
                    title="Click to filter by this sender"
                >
                    <div className="flex items-center gap-1">
                        {msg.sender.profileImageUrl && (
                            <img
                                src={msg.sender.profileImageUrl}
                                alt={msg.sender.name}
                                className="w-5 h-5 rounded-full"
                            />
                        )}
                        <span className="font-semibold line-clamp-1"> @{msg.sender.username || "-"}</span>
                        <div className="text-gray-500 text-xs">{timeAgo(msg.sender.createdAt)}</div>
                    </div>
                </div>
            )}

            {/* Arrow */}
            <ArrowRight className="w-4 h-4 text-gray-500 flex-shrink-0" />

            {/* Recipients */}
            {msg.recipients?.length > 0 && (
                <div className="flex gap-3">
                    {msg.recipients.map((r) => (
                        <div
                            key={r.id}
                            className="text-xs space-y-1 cursor-pointer"
                            onClick={(e) => handleFilterClick(e, r.id)}
                            title="Click to filter by this recipient"
                        >
                            <div className="flex items-center gap-1">
                                {r.profileImageUrl && (
                                    <img
                                        src={r.profileImageUrl}
                                        alt={r.name}
                                        className="w-5 h-5 rounded-full"
                                    />
                                )}
                                <span className="font-semibold">@{r.username || "-"}</span>
                                <div className="text-gray-500 text-xs">{timeAgo(r.createdAt)}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

    );
}

export default MessageMetaInfo;
