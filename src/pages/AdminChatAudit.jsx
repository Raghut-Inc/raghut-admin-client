import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleString('ko-KR', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

const AdminChatAudit = () => {
    const [interactions, setInteractions] = useState([]);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [loadingList, setLoadingList] = useState(false);

    const [selectedId, setSelectedId] = useState(null);
    const [detail, setDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // Ref for the chat messages container to handle auto-scroll
    const chatEndRef = useRef(null);

    const fetchList = useCallback(async (targetPage = 1) => {
        setLoadingList(true);
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/analytics/chat-recent-usage?page=${targetPage}&limit=20`, { withCredentials: true });
            setInteractions(res.data.data);
            setPagination(res.data.pagination);
            setPage(targetPage);
        } catch (err) {
            console.error("List fetch failed", err);
        } finally {
            setLoadingList(false);
        }
    }, []);

    const fetchHistory = async (userId, questionId, interactionId, resultId) => {
        setSelectedId(interactionId);
        setLoadingDetail(true);
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/analytics/chat-history/${userId}/${questionId}`, { withCredentials: true });
            setDetail(res.data);
        } catch (err) {
            console.error("Detail fetch failed", err);
        } finally {
            setLoadingDetail(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('ID Copied!');
    };

    useEffect(() => { fetchList(); }, [fetchList]);

    // Scroll to bottom whenever detail history updates
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollTop = chatEndRef.current.scrollHeight;
        }
    }, [detail]);

    return (
        <div className="flex h-[calc(100svh-3rem)] bg-gray-100 font-sans text-sm overflow-hidden relative">

            {/* LEFT SIDE: Interaction List */}
            {/* Logic: Hidden on mobile if an item is selected */}
            <div className={`${selectedId ? 'hidden' : 'flex'} md:flex w-full md:w-1/3 flex-col border-r bg-white shadow-lg`}>
                <div className="flex space-x-1 p-2 w-full font-semibold items-center justify-between bg-gray-50 border-b">
                    <p className="font-semibold w-full text-gray-500">추가질문</p>
                    <span className="text-xs text-gray-400 flex-shrink-0">Total {pagination.totalCount || 0}</span>
                </div>

                <div className="flex-1 overflow-y-auto divide-y">
                    {loadingList ? (
                        <div className="p-3 text-center text-gray-400 italic">Loading interactions...</div>
                    ) : (
                        interactions.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => fetchHistory(item.userId, item.questionId, item.id, item.resultId)}
                                className={`p-3 cursor-pointer transition-colors hover:bg-blue-50 ${selectedId === item.id ? 'bg-blue-100 border-l-4 border-l-blue-500' : ''}`}
                            >
                                <div className="flex gap-3 items-center">
                                    {item.questionImage && (
                                        <img src={item.questionImage} alt="q" className="w-12 h-12 rounded object-cover bg-gray-200" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between">
                                            <span className="font-semibold truncate">{item.userName}</span>
                                            <span className="text-[10px] text-gray-400 whitespace-nowrap">{formatTime(item.updatedAt)}</span>
                                        </div>
                                        <p className="text-gray-600 truncate text-xs">{item.questionNumber}번: {item.lastSnippet}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-3 border-t bg-gray-50 flex justify-between items-center">
                    <button
                        disabled={!pagination.hasPrevPage}
                        onClick={() => fetchList(page - 1)}
                        className="px-3 py-1 bg-white border rounded shadow-sm disabled:opacity-30 text-xs"
                    >Prev</button>
                    <span className="text-gray-500 text-xs">Page {page} of {pagination.totalPages}</span>
                    <button
                        disabled={!pagination.hasNextPage}
                        onClick={() => fetchList(page + 1)}
                        className="px-3 py-1 bg-white border rounded shadow-sm disabled:opacity-30 text-xs"
                    >Next</button>
                </div>
            </div>

            {/* RIGHT SIDE: Detail View */}
            {/* Logic: Hidden on mobile if no item is selected */}
            <div className={`${selectedId ? 'flex' : 'hidden'} md:flex flex-1 flex flex-col bg-gray-50 overflow-hidden`}>
                {loadingDetail ? (
                    <div className="m-auto text-gray-400 italic">Loading thread context...</div>
                ) : detail ? (
                    <>
                        {/* ID & Info Header */}
                        <div className="bg-white border-b p-1.5 shadow-sm">
                            <div className="flex items-center gap-2">
                                {/* Mobile Back Button */}
                                <button
                                    onClick={() => setSelectedId(null)}
                                    className="md:hidden p-2 mr-1 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>

                                {/* IDs Toolbar */}
                                <div className="flex flex-wrap gap-2">
                                    <div onClick={() => copyToClipboard(interactions.find(i => i.id === selectedId)?.userId)} className="flex items-center bg-gray-100 rounded px-2 border border-gray-200 cursor-pointer">
                                        <span className="text-[10px] font-bold text-gray-500 mr-2">USER_ID:</span>
                                        <code className="text-[10px] text-indigo-600 font-mono truncate max-w-[80px] md:max-w-none">{selectedId ? interactions.find(i => i.id === selectedId)?.userId : 'N/A'}</code>
                                        <button className="ml-2 text-gray-400 hover:text-blue-500">📋</button>
                                    </div>
                                    <div onClick={() => copyToClipboard(detail.resultId)} className="flex items-center bg-gray-100 rounded px-2 border border-gray-200 cursor-pointer">
                                        <span className="text-[10px] font-bold text-gray-500 mr-2">RESULT_ID:</span>
                                        <code className="text-[10px] text-indigo-600 font-mono truncate max-w-[80px] md:max-w-none">{detail.resultId}</code>
                                        <button className="ml-2 text-gray-400 hover:text-blue-500">📋</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chat History Thread */}
                        <div
                            ref={chatEndRef}
                            className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-50 scroll-smooth"
                        >
                            {detail.thread.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] md:max-w-[75%] p-3 rounded-2xl shadow-sm ${msg.sender === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                                        }`}>
                                        <div className="flex justify-between items-center gap-4 mb-1">
                                            <p className="text-[9px] font-black uppercase tracking-widest opacity-60">{msg.sender}</p>
                                            <p className="text-[9px] opacity-50">{formatTime(msg.time)}</p>
                                        </div>
                                        <p className="text-xs whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="m-auto text-gray-400 flex flex-col items-center p-6 text-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl">🔍</span>
                        </div>
                        <p className="font-medium">Select a conversation to audit AI responses</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminChatAudit;