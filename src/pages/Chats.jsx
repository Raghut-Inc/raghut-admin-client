import React, { useEffect, useState, useCallback, useRef } from "react";
import { timeAgo } from "../utils/timeAgo";
import MessageMetaInfo from "../components/MessageMetaInfo";

const PAGE_SIZE = 100;

const AdminChats = ({ user, setUser }) => {
    const [messages, setMessages] = useState([]);
    const [friendActivity, setFriendActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [friendsLoading, setFriendsLoading] = useState(true);
    const [showFriends, setShowFriends] = useState(true);
    const [filter, setFilter] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [excludeBot, setExcludeBot] = useState(false); // ✅ toggle state
    const anchorRef = useRef(null); // avoids dependency loops

    // ---------- Load messages ----------
    const fetchMessages = useCallback(
        async (isLoadMore = false) => {
            try {
                if (isLoadMore) setLoadingMore(true);
                else {
                    setLoading(true);
                    setHasMore(true);
                    anchorRef.current = null;
                    setMessages([]);
                }

                const beforeParam =
                    isLoadMore && anchorRef.current
                        ? `&before=${encodeURIComponent(anchorRef.current)}`
                        : "";
                let url = `${process.env.REACT_APP_API_URL}/messages/admin/all?limit=${PAGE_SIZE}${beforeParam}`;
                if (filter?.userId) url += `&userId=${filter.userId}`;
                if (excludeBot) url += `&excludeBot=true`; // ✅ new param

                const res = await fetch(url, { credentials: "include" });
                const data = await res.json();

                if (!data.messages || data.messages.length === 0) {
                    setHasMore(false);
                    return;
                }

                const newMsgs = data.messages;

                // Merge uniquely
                setMessages((prev) => {
                    const ids = new Set(prev.map((m) => m.id));
                    const merged = [...prev];
                    newMsgs.forEach((m) => {
                        if (!ids.has(m.id)) merged.push(m);
                    });
                    return merged;
                });

                // Update anchor
                const oldest = newMsgs[newMsgs.length - 1]?.createdAt;
                if (oldest) anchorRef.current = oldest;

                if (newMsgs.length < PAGE_SIZE) setHasMore(false);
            } catch (err) {
                console.error("❌ Failed to load messages", err);
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [filter, excludeBot] // ✅ refetch when toggled
    );

    // ---------- Initial load ----------
    useEffect(() => {
        fetchMessages(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter, excludeBot]); // ✅ refresh when toggled

    // ---------- Infinite scroll ----------
    useEffect(() => {
        if (!hasMore || loadingMore) return;
        let ticking = false;

        const onScroll = () => {
            if (ticking) return;
            ticking = true;

            requestAnimationFrame(() => {
                const nearBottom =
                    window.innerHeight + window.scrollY >=
                    document.documentElement.scrollHeight - 200;

                if (nearBottom && !loadingMore && hasMore) {
                    fetchMessages(true);
                }

                ticking = false;
            });
        };

        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, [hasMore, loadingMore, fetchMessages]);

    // ---------- Friend activity ----------
    useEffect(() => {
        const fetchFriends = async () => {
            try {
                setFriendsLoading(true);
                const res = await fetch(`${process.env.REACT_APP_API_URL}/analytics/friend-activity?limit=50`, {
                    credentials: "include",
                });
                const data = await res.json();
                if (data.data) setFriendActivity(data.data);
            } catch (err) {
                console.error("❌ Failed to load friend activity", err);
            } finally {
                setFriendsLoading(false);
            }
        };
        fetchFriends();
    }, []);

    // ---------- Render ----------
    return (
        <div>
            <div className="max-w-5xl mx-auto font-sans">

                {/* --- Recent Friend Additions --- */}
                <div className="mt-2 mb-4 border border-gray-200 bg-white shadow-sm">
                    <div
                        className="flex items-center justify-between px-4 py-2 cursor-pointer select-none bg-gray-50 border-b"
                        onClick={() => setShowFriends(!showFriends)}
                    >
                        <h2 className="text-sm font-semibold text-gray-800">
                            Recent Friend Additions
                        </h2>
                        <span className="text-xs text-gray-500">
                            {showFriends ? "▼" : "▲"}
                        </span>
                    </div>

                    {showFriends && (
                        <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                            {friendsLoading ? (
                                <p className="text-gray-500 text-sm p-4">Loading friend activity…</p>
                            ) : friendActivity.length === 0 ? (
                                <p className="text-gray-500 text-sm p-4">No recent friend additions.</p>
                            ) : (
                                friendActivity.map((f, i) => (
                                    <div
                                        key={i}
                                        className="flex justify-between items-center px-4 py-2 text-sm"
                                    >
                                        <div className="flex items-center gap-2">
                                            {f.a?.profileImageUrl && (
                                                <img
                                                    src={f.a.profileImageUrl}
                                                    alt=""
                                                    className="w-6 h-6 rounded-full object-cover"
                                                />
                                            )}
                                            <span className="font-semibold text-gray-800">
                                                {f.a?.username || f.a?.name}
                                            </span>
                                            <span className="text-gray-400 text-xs">↔</span>
                                            {f.b?.profileImageUrl && (
                                                <img
                                                    src={f.b.profileImageUrl}
                                                    alt=""
                                                    className="w-6 h-6 rounded-full object-cover"
                                                />
                                            )}
                                            <span className="font-semibold text-gray-800">
                                                {f.b?.username || f.b?.name}
                                            </span>
                                        </div>
                                        <span className="text-gray-400 text-xs">{timeAgo(f.updatedAt)}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* --- Toggle Button --- */}
                <div className="flex justify-end items-center my-3">
                    <button
                        onClick={() => setExcludeBot((v) => !v)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md shadow-sm transition-colors border
              ${excludeBot
                                ? "bg-indigo-600 text-white border-indigo-700"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                            }`}
                    >
                        {excludeBot ? "🤖 Excluding Bot" : "Include Bot"}
                    </button>
                </div>

                {/* --- Messages Section --- */}
                <div className="divide-y">
                    {loading ? (
                        <p className="text-gray-500 text-center py-6">Loading messages…</p>
                    ) : (
                        <>
                            {messages.map((m) => (
                                <div key={m.id} className="p-2 border-gray-200 flex flex-col items-start">
                                    <div className="p-2 rounded-lg space-y-1">
                                        <MessageMetaInfo msg={m} timeAgo={timeAgo} setFilter={setFilter} />
                                        <p className="text-[10px] text-gray-400 font-mono">
                                            {m.createdAt ? timeAgo(m.createdAt) : "-"}, id: {m.id}
                                        </p>
                                    </div>

                                    <div className="bg-gray-100 text-xs p-2 rounded">
                                        {m.text && <p className="text-gray-800">{m.text}</p>}

                                        {m.attachments?.length > 0 && (
                                            <div className="space-x-2 mt-1 flex flex-wrap">
                                                {m.attachments.map((a, i) => (
                                                    <a
                                                        key={i}
                                                        href={a.thumbUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-block"
                                                    >
                                                        <img
                                                            src={a.thumbUrl}
                                                            alt=""
                                                            className="w-16 h-16 object-cover rounded"
                                                        />
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {loadingMore && (
                                <p className="text-center text-gray-500 py-4">Loading more…</p>
                            )}
                            {!hasMore && !loadingMore && (
                                <p className="text-center text-sm py-4 text-gray-600">
                                    🔚 No more messages 🔚
                                </p>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminChats;
