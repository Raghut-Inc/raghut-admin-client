import React, { useEffect, useState, useCallback } from 'react';
import { timeAgo } from '../utils/timeAgo';

const PAGE_SIZE = 30;
const MSG_PAGE_SIZE = 20;

const Chats = () => {
    const [chats, setChats] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Messages state for currently expanded chat
    const [expandedChatId, setExpandedChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [msgPage, setMsgPage] = useState(1);
    const [msgTotalPages, setMsgTotalPages] = useState(1);
    const [msgLoading, setMsgLoading] = useState(false);
    const [msgError, setMsgError] = useState(null);

    const fetchChats = useCallback(async (pageNum) => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(
                `${process.env.REACT_APP_API_URL}/chat/admin/chats?page=${pageNum}&pageSize=${PAGE_SIZE}`,
                { credentials: 'include', headers: { 'Content-Type': 'application/json' } }
            );
            if (!res.ok) throw new Error('Failed to fetch chats');
            const data = await res.json();

            setChats(data.chats);
            setPage(data.page);
            setTotalPages(data.totalPages);
        } catch (err) {
            setError(err.message || 'Unknown error');
        }
        setLoading(false);
    }, []);

    const fetchMessages = useCallback(
        async (chatRoomId, msgPageNum = 1) => {
            setMsgLoading(true);
            setMsgError(null);
            try {
                const res = await fetch(
                    `${process.env.REACT_APP_API_URL}/chat/admin/chats/${chatRoomId}/messages?page=${msgPageNum}&pageSize=${MSG_PAGE_SIZE}`,
                    { credentials: 'include', headers: { 'Content-Type': 'application/json' } }
                );
                if (!res.ok) throw new Error('Failed to fetch messages');
                const data = await res.json();

                setMessages(data.messages);
                setMsgPage(data.page);
                setMsgTotalPages(data.totalPages);
            } catch (err) {
                setMsgError(err.message || 'Unknown error');
            }
            setMsgLoading(false);
        },
        []
    );

    useEffect(() => {
        fetchChats(page);
    }, [page, fetchChats]);

    // Fetch messages when expandedChatId or msgPage changes
    useEffect(() => {
        if (expandedChatId) {
            fetchMessages(expandedChatId, msgPage);
        } else {
            setMessages([]);
            setMsgPage(1);
            setMsgTotalPages(1);
            setMsgError(null);
            setMsgLoading(false);
        }
    }, [expandedChatId, msgPage, fetchMessages]);

    // Handle click toggling messages view for chat
    const toggleChatMessages = (chatRoomId) => {
        if (expandedChatId === chatRoomId) {
            // Collapse if already expanded
            setExpandedChatId(null);
        } else {
            setExpandedChatId(chatRoomId);
            setMsgPage(1); // reset messages page when switching chat
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6 font-sans">
            {loading && (
                <div className="text-center py-10 text-indigo-500 font-medium">Loading chats…</div>
            )}

            {error && (
                <div className="text-center py-4 text-red-600 font-semibold">{error}</div>
            )}

            {!loading && !error && chats.length === 0 && (
                <div className="text-center py-10 text-gray-500">No chats found.</div>
            )}

            <div className="space-y-4">
                {chats.map((chat) => (
                    <div
                        key={chat.chatRoomId}
                        className="shadow rounded-md bg-white overflow-hidden border border-gray-200"
                    >
                        {/* Header with colored banner */}
                        <div
                            className={`px-4 py-2 text-xs font-semibold text-white flex justify-between items-center
                ${chat.messageCount === 0 ? 'bg-red-500' : 'bg-indigo-600'}`}
                        >
                            <span>{chat.messageCount === 0 ? 'No messages yet' : `${chat.messageCount} messages`}</span>
                            <span className="italic text-indigo-200 text-xs">
                                {timeAgo(chat.createdAt)} ({new Date(chat.createdAt).toLocaleDateString()})
                            </span>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-2 text-sm text-gray-700">
                            <div className="flex flex-wrap gap-4">
                                <InfoItem label="Chat Room ID" value={chat.chatRoomId} copyable />
                                <InfoItem label="User ID" value={chat.userId || '-'} copyable />
                                <InfoItem label="Result ID" value={chat.resultId} />
                                <InfoItem label="Question ID" value={chat.questionId} />
                            </div>

                            <div>
                                <strong>Last message preview:</strong>
                                <p
                                    className="mt-1 text-gray-600 truncate cursor-default"
                                    title={chat.lastMessagePreview || 'No messages'}
                                >
                                    {chat.lastMessagePreview || 'No messages'}
                                </p>
                            </div>

                            <button
                                onClick={() => toggleChatMessages(chat.chatRoomId)}
                                className="mt-3 px-3 py-1 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                            >
                                {expandedChatId === chat.chatRoomId ? 'Hide Messages' : 'View Messages'}
                            </button>

                            {/* Messages list */}
                            {expandedChatId === chat.chatRoomId && (
                                <div className="mt-4 border-t border-gray-200 pt-4 max-h-96 overflow-auto">
                                    {msgLoading && (
                                        <p className="text-indigo-600 font-medium text-center">Loading messages...</p>
                                    )}
                                    {msgError && (
                                        <p className="text-red-600 font-semibold text-center">{msgError}</p>
                                    )}
                                    {!msgLoading && !msgError && messages.length === 0 && (
                                        <p className="text-gray-500 text-center italic">No messages in this chat.</p>
                                    )}
                                    {!msgLoading && messages.length > 0 && (
                                        <ul className="space-y-3">
                                            {messages.map((msg) => (
                                                <li
                                                    key={msg.id || msg._id}
                                                    className={`p-3 rounded-md ${msg.sender === 'assistant'
                                                            ? 'bg-indigo-50 text-indigo-800'
                                                            : 'bg-gray-100 text-gray-900'
                                                        }`}
                                                >
                                                    <div className="flex justify-between text-xs font-mono mb-1">
                                                        <span>{msg.sender}</span>
                                                        <time
                                                            dateTime={msg.timestamp}
                                                            title={new Date(msg.timestamp).toLocaleString()}
                                                        >
                                                            {timeAgo(msg.timestamp)}
                                                        </time>
                                                    </div>
                                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {/* Message pagination */}
                                    {msgTotalPages > 1 && (
                                        <div className="flex justify-center items-center gap-4 mt-4">
                                            <button
                                                disabled={msgPage <= 1}
                                                onClick={() => setMsgPage((p) => Math.max(p - 1, 1))}
                                                className={`px-3 py-1 rounded-md font-semibold ${msgPage <= 1
                                                        ? 'bg-gray-300 cursor-not-allowed'
                                                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                    }`}
                                            >
                                                Prev
                                            </button>
                                            <span className="text-sm text-gray-600">
                                                Page {msgPage} of {msgTotalPages}
                                            </span>
                                            <button
                                                disabled={msgPage >= msgTotalPages}
                                                onClick={() => setMsgPage((p) => Math.min(p + 1, msgTotalPages))}
                                                className={`px-3 py-1 rounded-md font-semibold ${msgPage >= msgTotalPages
                                                        ? 'bg-gray-300 cursor-not-allowed'
                                                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                    }`}
                                            >
                                                Next
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Chats pagination */}
            <div className="flex justify-center items-center gap-4 mt-6">
                <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    className={`px-3 py-1 rounded-md font-semibold ${page <= 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                >
                    Prev
                </button>
                <span className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                </span>
                <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    className={`px-3 py-1 rounded-md font-semibold ${page >= totalPages
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

function InfoItem({ label, value, copyable }) {
    const copyToClipboard = () => {
        if (value) {
            navigator.clipboard.writeText(value).catch(() => alert('복사에 실패했습니다.'));
        }
    };

    return (
        <div className="flex flex-col min-w-[150px]">
            <span className="text-xs font-semibold text-indigo-500">{label}</span>
            <span
                className={`mt-0.5 text-xs text-gray-700 truncate ${copyable ? 'cursor-pointer hover:text-indigo-600' : ''}`}
                onClick={copyable ? copyToClipboard : undefined}
                title={value}
            >
                {value || '-'}
            </span>
        </div>
    );
}

export default Chats;
