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
    const [pagination, setPagination] = useState({ totalPages: 1 });
    const [loadingList, setLoadingList] = useState(false);

    const [selectedId, setSelectedId] = useState(null);
    const [detail, setDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const chatEndRef = useRef(null);

    // --- INFINITE SCROLL LOGIC ---
    const observer = useRef();

    // This ref is attached to the last item in the list
    const lastInteractionElementRef = useCallback(node => {
        if (loadingList) return; // Don't trigger if already loading
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            // If the last element is visible and we haven't reached the end
            if (entries[0].isIntersecting && page < pagination.totalPages) {
                setPage(prevPage => prevPage + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [loadingList, page, pagination.totalPages]);

    // Modified fetchList: Appends data unless it's the first page
    const fetchList = useCallback(async (targetPage = 1) => {
        setLoadingList(true);
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/analytics/chat-recent-usage?page=${targetPage}&limit=20`, { withCredentials: true });

            setInteractions(prev => {
                // If resetting to page 1, replace. Otherwise, append unique items.
                return targetPage === 1 ? res.data.data : [...prev, ...res.data.data];
            });

            setPagination(res.data.pagination);
        } catch (err) {
            console.error("List fetch failed", err);
        } finally {
            setLoadingList(false);
        }
    }, []);

    // Fetch on mount and when page changes
    useEffect(() => {
        fetchList(page);
    }, [page, fetchList]);

    // --- DETAIL VIEW LOGIC ---
    const fetchHistory = async (userId, questionId, interactionId) => {
        setSelectedId(interactionId);
        setLoadingDetail(true);
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/analytics/chat-history/${userId}/${questionId}`, { withCredentials: true });
            setDetail({
                ...res.data,
                userId: userId,
                questionId: questionId
            });
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

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollTop = chatEndRef.current.scrollHeight;
        }
    }, [detail]);

    return (
        <div className="flex h-[calc(100svh-3rem)] bg-gray-100 font-sans text-sm overflow-hidden relative">

            {/* LEFT SIDE: Interaction List */}
            <div className={`${selectedId ? 'hidden' : 'flex'} md:flex w-full md:w-1/3 flex-col border-r bg-white shadow-lg`}>
                <div className="flex space-x-1 p-3 w-full font-semibold items-center justify-between bg-gray-50 border-b">
                    <p className="font-semibold w-full text-gray-500">추가질문 감사</p>
                    <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded-full text-gray-600 flex-shrink-0">
                        Total {pagination.totalCount || 0}
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto divide-y scrollbar-hide">
                    {interactions.map((item, index) => {
                        // Check if this is the last item in the current array
                        const isLast = interactions.length === index + 1;
                        return (
                            <div
                                key={`${item.id}-${index}`}
                                ref={isLast ? lastInteractionElementRef : null}
                                onClick={() => fetchHistory(item.userId, item.questionId, item.id)}
                                className={`p-3 cursor-pointer transition-all hover:bg-blue-50 ${selectedId === item.id ? 'bg-blue-100 border-l-4 border-l-blue-500' : ''}`}
                            >
                                <div className="flex gap-3 items-center">
                                    {item.questionImage && (
                                        <img src={item.questionImage} alt="q" className="w-12 h-12 rounded border object-cover bg-gray-100" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline">
                                            <span className="font-bold truncate text-gray-800">{item.userName}</span>
                                            <span className="text-[9px] text-gray-400 whitespace-nowrap ml-2">{formatTime(item.updatedAt)}</span>
                                        </div>
                                        <p className="text-gray-500 truncate text-xs mt-1">
                                            <span className="font-medium text-blue-600 mr-1">#{item.questionNumber}</span>
                                            {item.lastSnippet}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {loadingList && (
                        <div className="p-4 text-center text-gray-400 text-xs italic animate-pulse">
                            Loading more interactions...
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT SIDE: Detail View */}
            <div className={`${selectedId ? 'flex' : 'hidden'} md:flex flex-1 flex flex-col bg-gray-50 overflow-hidden`}>
                {loadingDetail ? (
                    <div className="m-auto flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-400 italic">Fetching thread...</span>
                    </div>
                ) : detail ? (
                    <>
                        {/* Header */}
                        <div className="bg-white border-b p-2 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <button onClick={() => setSelectedId(null)} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <div className="hidden sm:flex gap-2">
                                    <div onClick={() => copyToClipboard(detail.questionId)} className="cursor-pointer bg-gray-100 px-2 py-1 rounded border text-[10px] font-mono text-gray-600 hover:bg-gray-200">
                                        QId: {detail.questionId?.substring(0, 8)}... 📋
                                    </div>
                                    <div onClick={() => copyToClipboard(detail.userId)} className="cursor-pointer bg-gray-100 px-2 py-1 rounded border text-[10px] font-mono text-gray-600 hover:bg-gray-200">
                                        USER: {detail.userId?.substring(0, 8)}... 📋
                                    </div>
                                    <div onClick={() => copyToClipboard(detail.resultId)} className="cursor-pointer bg-gray-100 px-2 py-1 rounded border text-[10px] font-mono text-gray-600 hover:bg-gray-200">
                                        RESULT: {detail.resultId?.substring(0, 8)}... 📋
                                    </div>
                                </div>
                            </div>
                            <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wider px-3">
                                Thread Context
                            </div>
                        </div>

                        {/* Chat Thread */}
                        <div ref={chatEndRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth">
                            {detail.thread.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl shadow-sm ${msg.sender === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                        }`}>
                                        <div className="flex justify-between items-center mb-1.5 border-b border-black/10 pb-1">
                                            <span className="text-[9px] font-bold uppercase tracking-widest opacity-70">{msg.sender}</span>
                                            <span className="text-[9px] opacity-60">{formatTime(msg.time)}</span>
                                        </div>
                                        <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="m-auto text-center opacity-40">
                        <div className="text-4xl mb-2">💬</div>
                        <p className="text-sm font-medium">Select a conversation to audit</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminChatAudit;