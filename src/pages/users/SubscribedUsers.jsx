import React, { useEffect, useState, useCallback } from "react";
import UserCell from "../../components/UserCell";

const PAGE_SIZE = 25;

const STATUS_OPTIONS = [
    { label: "활성", value: "active" },
    { label: "취소됨", value: "canceled" },
    { label: "만료됨", value: "expired" },
    { label: "없음", value: "none" },
    { label: "전체", value: "all" },
];

const SORT_OPTIONS = [
    { label: "이름", value: "name" },
    { label: "가입일", value: "createdAt" },
    { label: "만료일", value: "subscriptionExpiresAt" },
];

const SubscribedUsers = ({ setFilter }) => {
    const [users, setUsers] = useState([]);
    const [status, setStatus] = useState("active");
    const [sortBy, setSortBy] = useState("subscriptionExpiresAt");
    const [order, setOrder] = useState("desc");
    const [type, setType] = useState("");
    const [search, setSearch] = useState("");

    const [page, setPage] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const loadSubscribers = useCallback(
        async (pageToLoad) => {
            try {
                if (pageToLoad === 1) setLoading(true);
                else setLoadingMore(true);

                const params = new URLSearchParams();
                params.set("status", status);
                params.set("sortBy", sortBy);
                params.set("order", order);
                params.set("page", pageToLoad);
                params.set("limit", PAGE_SIZE);
                if (type) params.set("type", type);
                if (search.trim()) params.set("search", search.trim());

                const res = await fetch(
                    `${process.env.REACT_APP_API_URL}/analytics/subscribers?${params.toString()}`,
                    { credentials: "include" }
                );
                const data = await res.json();

                if (!data.success) {
                    console.error("⚠️ Failed to load subscribers:", data.error);
                    return;
                }

                if (pageToLoad === 1) setUsers(data.users || []);
                else setUsers((prev) => [...prev, ...(data.users || [])]);
                setTotalUsers(data.total || 0);
                setHasMore((data.users || []).length === PAGE_SIZE);
            } catch (err) {
                console.error("❌ Subscribers API error:", err);
            } finally {
                if (pageToLoad === 1) setLoading(false);
                else setLoadingMore(false);
            }
        },
        [status, sortBy, order, type, search]
    );

    // Initial load
    useEffect(() => {
        setPage(1);
        setHasMore(true);
        loadSubscribers(1);
    }, [status, sortBy, order, type, search, loadSubscribers]);

    // Infinite scroll
    useEffect(() => {
        if (!hasMore || loadingMore) return;
        const onScroll = () => {
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 300) {
                setPage((p) => p + 1);
            }
        };
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, [hasMore, loadingMore]);

    // Load next pages
    useEffect(() => {
        if (page === 1) return;
        loadSubscribers(page);
    }, [page, loadSubscribers]);

    return (
        <div className="w-full font-sans bg-gray-200 min-h-screen flex flex-col items-center">
            <div className="w-full max-w-4xl flex flex-col items-center">
                <div className="flex justify-between w-full items-center px-2 py-3">
                    <p className="font-bold text-gray-700">💳 구독자 목록</p>
                    <p className="text-sm text-gray-600">
                        총 <b>{totalUsers}</b>명
                    </p>
                </div>

                {/* Filter bar */}
                <div className="flex flex-wrap items-center gap-2 w-full px-2 py-2 bg-gray-100 text-xs text-gray-700">
                    <select
                        className="px-2 py-1 border border-gray-300 rounded"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    <select
                        className="px-2 py-1 border border-gray-300 rounded"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        {SORT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    <select
                        className="px-2 py-1 border border-gray-300 rounded"
                        value={order}
                        onChange={(e) => setOrder(e.target.value)}
                    >
                        <option value="desc">내림차순</option>
                        <option value="asc">오름차순</option>
                    </select>

                    <input
                        type="text"
                        className="px-2 py-1 border border-gray-300 rounded flex-1 min-w-[120px]"
                        placeholder="이름, 이메일, 아이디 검색"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />

                    <select
                        className="px-2 py-1 border border-gray-300 rounded"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option value="">모든 타입</option>
                        <option value="monthly_krw9900">월간 ₩9,900</option>
                        <option value="yearly_krw99000">연간 ₩99,000</option>
                    </select>
                </div>

                {/* Subscriber list */}
                <div className="bg-gray-800 divide-y divide-gray-600 w-full">
                    {loading ? (
                        <div className="text-center text-gray-400 py-6">Loading…</div>
                    ) : users.length === 0 ? (
                        <div className="text-center text-gray-400 py-6">No subscribers found.</div>
                    ) : (
                        users.map((user) => (
                            <UserCell
                                key={user._id}
                                compact={true}
                                onFilter={setFilter}
                                user={user}
                                stats={{
                                    totalUploads: user.uploads,
                                    totalQuestions: user.totalQuestions,
                                    todayUploads: user.todayUploads,
                                    todayQuestions: user.todayQuestions,
                                    activeDays: user.activeDays,
                                    firstAt: user.firstAt,
                                    lastAt: user.lastAt,
                                    avgProcessingTimeMs: user.avgProcessingTimeMs,
                                }}
                            />
                        ))
                    )}
                    {loadingMore && <p className="text-center py-4 text-gray-400">Loading more…</p>}
                    {!hasMore && users.length > 0 && (
                        <p className="text-center py-4 text-gray-500 text-sm">🔚 No more users 🔚</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubscribedUsers;
