import React, { useEffect, useState, useCallback } from "react";
import UserCell from "../../components/UserCell";

const PAGE_SIZE = 25;
const TZ = "Asia/Seoul";

const DailyActiveUsers = ({ setFilter }) => {
    const [dailyRows, setDailyRows] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const [date, setDate] = useState(
        new Intl.DateTimeFormat("en-CA", {
            timeZone: TZ,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).format(new Date())
    );

    const [prevDate, setPrevDate] = useState(null);
    const [nextDate, setNextDate] = useState(null);

    const [sortBy, setSortBy] = useState("last");
    const [order, setOrder] = useState("desc");

    const loadDailyUploaders = useCallback(
        async (pageToLoad) => {
            try {
                if (pageToLoad === 1) setLoading(true);
                else setLoadingMore(true);

                const params = new URLSearchParams();
                params.set("date", date);
                params.set("tz", TZ);
                params.set("page", pageToLoad);
                params.set("limit", PAGE_SIZE);
                params.set("sortBy", sortBy);
                params.set("order", order);
                params.set("includeLifetime", "1");

                const res = await fetch(
                    `${process.env.REACT_APP_API_URL}/analytics/daily-uploaders?${params.toString()}`,
                    { credentials: "include" }
                );
                const data = await res.json();

                if (!data.success) {
                    console.error("⚠️ Failed to load daily uploaders:", data.error);
                    return;
                }

                if (pageToLoad === 1) setDailyRows(data.users || []);
                else setDailyRows((prev) => [...prev, ...(data.users || [])]);

                setPrevDate(data.prevDate || null);
                setNextDate(data.nextDate || null);
                setHasMore((data.users || []).length === PAGE_SIZE);
            } catch (err) {
                console.error("❌ Daily uploaders API error:", err);
            } finally {
                if (pageToLoad === 1) setLoading(false);
                else setLoadingMore(false);
            }
        },
        [date, sortBy, order]
    );

    // initial load
    useEffect(() => {
        setPage(1);
        setHasMore(true);
        loadDailyUploaders(1);
    }, [date, sortBy, order, loadDailyUploaders]);

    // infinite scroll
    useEffect(() => {
        if (!hasMore || loadingMore) return;
        const onScroll = () => {
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 300) {
                setPage((prev) => prev + 1);
            }
        };
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, [hasMore, loadingMore]);

    // load more pages
    useEffect(() => {
        if (page === 1) return;
        loadDailyUploaders(page);
    }, [page, loadDailyUploaders]);

    const pageUploads = dailyRows.reduce((s, r) => s + (r.uploads || 0), 0);
    const pageQuestions = dailyRows.reduce((s, r) => s + (r.totalQuestions || 0), 0);

    return (
        <div className="w-full font-sans bg-gray-200 min-h-screen flex flex-col h-full items-center">
            <div className="w-full max-w-4xl flex flex-col items-center">
                <div className="flex flex-col sm:flex-row justify-between w-full items-center px-2 py-3">
                    <p className="font-bold text-gray-700 text-lg">📅 {date} 업로드 유저</p>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => prevDate && setDate(prevDate)}
                            className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-300"
                            disabled={!prevDate}
                        >
                            ← 이전날
                        </button>

                        <input
                            type="date"
                            className="px-2 py-1 border border-gray-300 rounded bg-white text-sm"
                            value={date}
                            onChange={(e) => {
                                setDate(e.target.value);
                                setPage(1);
                            }}
                        />

                        <button
                            onClick={() => nextDate && setDate(nextDate)}
                            className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-300"
                            disabled={!nextDate}
                        >
                            다음날 →
                        </button>
                    </div>
                </div>

                {/* Sort controls */}
                <div className="flex items-center gap-2 mb-2 text-xs text-gray-700 px-2 w-full">
                    <label>정렬:</label>
                    <select
                        className="px-2 py-1 border border-gray-300 rounded text-xs"
                        value={sortBy}
                        onChange={(e) => {
                            setSortBy(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="questions">문제수</option>
                        <option value="uploads">업로드수</option>
                        <option value="last">최근업로드</option>
                    </select>
                    <select
                        className="px-2 py-1 border border-gray-300 rounded text-xs"
                        value={order}
                        onChange={(e) => {
                            setOrder(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="desc">내림차순</option>
                        <option value="asc">오름차순</option>
                    </select>

                    <div className="ml-auto text-sm text-gray-600">
                        유저 <b>{dailyRows.length}</b> · 업로드 <b>{pageUploads}</b> · 문제 <b>{pageQuestions}</b>
                    </div>
                </div>

                {/* User list */}
                <div className="bg-gray-800 divide-y divide-gray-600 w-full">
                    {loading ? (
                        <div className="text-center text-gray-400 py-6">Loading…</div>
                    ) : dailyRows.length === 0 ? (
                        <div className="text-center text-gray-400 py-6">No uploads for this date.</div>
                    ) : (
                        dailyRows.map((row) => (
                            <UserCell
                                key={row.userId}
                                compact={true}
                                onFilter={setFilter}
                                user={{
                                    ...row.user,
                                    _id: row.userId,
                                }}
                                stats={{
                                    totalUploads: row.uploads,
                                    totalQuestions: row.totalQuestions,
                                    todayUploads: row.todayUploads,
                                    todayQuestions: row.todayQuestions,
                                    activeDays: row.activeDays,
                                    firstAt: row.firstAt,
                                    lastAt: row.lastAt,
                                    avgProcessingTimeMs: row.avgProcessingTimeMs,
                                }}
                            />
                        ))
                    )}
                    {loadingMore && <p className="text-center py-4 text-gray-400">Loading more…</p>}
                    {!hasMore && dailyRows.length > 0 && (
                        <p className="text-center py-4 text-gray-500 text-sm">🔚 No more users 🔚</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DailyActiveUsers;
