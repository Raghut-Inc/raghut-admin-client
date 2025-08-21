import React, { useEffect, useState } from "react";
import { timeAgo } from "../utils/timeAgo";
import NavBar from "../components/NavBar";
import MessageMetaInfo from "../components/MessageMetaInfo";

const AdminChats = ({ user, setUser }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState(null);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                let url = `${process.env.REACT_APP_API_URL}/messages/admin/all?limit=100`;
                if (filter?.userId) url += `&userId=${filter.userId}`;

                const res = await fetch(url, {
                    credentials: "include",
                });
                const data = await res.json();
                if (data.messages) setMessages(data.messages);
            } catch (err) {
                console.error("❌ Failed to load messages", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMessages();
    }, [filter]);

    return (
        <div>
            <NavBar user={user} setUser={setUser} animate={true} title={"모든 채팅"} />
            <div className="max-w-5xl mx-auto font-sans">
                {loading ? (
                    <p className="text-gray-500">Loading messages…</p>
                ) : (
                    messages.map((m) => (
                        <div key={m.id} className="p-4 border-b border-gray-200">
                            {/* Header: message text + time */}
                            <p className="text-sm text-gray-800">
                                {m.text || <span className="italic text-gray-500">[no text]</span>}
                            </p>

                            {/* Message ID */}
                            <p className="text-[10px] text-gray-400 font-mono mb-2">{m.createdAt ? timeAgo(m.createdAt) : "-"}, id: {m.id}</p>

                            {/* Attachments */}
                            {m.attachments?.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    {m.attachments.map((a, i) => (
                                        <a
                                            key={i}
                                            href={a.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-600 text-xs underline"
                                        >
                                            {a.type || "Attachment"} {i + 1}
                                        </a>
                                    ))}
                                </div>
                            )}

                            {/* Detailed meta info */}
                            <MessageMetaInfo msg={m} timeAgo={timeAgo} setFilter={setFilter} />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminChats;
