import { useEffect, useState } from "react";
import UserCell from "../UserCell"; // ✅ import your new reusable cell
const API_BASE = `${process.env.REACT_APP_API_URL}/analytics`;

const AnalyticsUsers = () => {
    const TZ = "UTC";
    const TODAY_STR = new Intl.DateTimeFormat("en-CA", {
        timeZone: TZ,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());

    const [dailyDate, setDailyDate] = useState(TODAY_STR);
    const [dailyRows, setDailyRows] = useState([]);
    const [dailyPage, setDailyPage] = useState(1);
    const [dailyLimit] = useState(100);
    const [dailyTotal, setDailyTotal] = useState(0);
    const [dailyTotalPages, setDailyTotalPages] = useState(1);
    const [dailyPrevDate, setDailyPrevDate] = useState(null);
    const [dailyNextDate, setDailyNextDate] = useState(null);
    const [dailySortBy, setDailySortBy] = useState("last");
    const [dailyOrder, setDailyOrder] = useState("desc");
    const [dailyLoading, setDailyLoading] = useState(false);
    const [, setError] = useState(null);

    const clampToToday = (isoDate) => {
        if (!isoDate) return TODAY_STR;
        return isoDate > TODAY_STR ? TODAY_STR : isoDate;
    };

    const fetchJson = async (url) => {
        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
        return res.json();
    };

    const pageUploads = dailyRows.reduce((s, r) => s + (r.requestCount || 0), 0);
    const pageQuestions = dailyRows.reduce((s, r) => s + (r.totalQuestions || 0), 0);

    useEffect(() => {
        setDailyLoading(true);
        fetchJson(
            `${API_BASE}/daily-uploaders?date=${dailyDate}&tz=${TZ}&page=${dailyPage}&limit=${dailyLimit}&sortBy=${dailySortBy}&order=${dailyOrder}&includeLifetime=1`
        )
            .then((r) => {
                setDailyRows(r.rows || []);
                setDailyTotal(r.total || 0);
                setDailyTotalPages(r.totalPages || 1);
                setDailyPrevDate(r.prevDate || null);
                setDailyNextDate(r.nextDate || null);
            })
            .catch((e) => setError(e.message))
            .finally(() => setDailyLoading(false));
    }, [dailyDate, dailyPage, dailyLimit, dailySortBy, dailyOrder]);

    const Header = ({ title, subtitle }) => (
        <div className="flex space-x-1 p-2 w-full font-semibold items-center max-w-4xl">
            <p className="font-semibold w-full text-gray-500">{title}</p>
            <p className="text-xs text-indigo-600 flex-shrink-0">{subtitle}</p>
        </div>
    );

    // ✅ Open uploads view in new tab
    const goToUploads = ({ userId, guestUUID } = {}) => {
        const params = new URLSearchParams();
        params.set("page", "1");
        params.set("pageSize", "25");
        if (userId) params.set("userId", userId);
        if (guestUUID) params.set("guestUUID", guestUUID);

        const url = `/admin/uploads?${params.toString()}`;
        window.open(url, "_blank", "noopener,noreferrer");
    };


    return (
        <div className="max-w-4xl w-full mb-16 font-sans">
            <Header title="일별 활성 업로더 (고유)" />

            {/* === Controls === */}
            <div className="mb-8">
                <div className="flex flex-wrap items-center gap-2 mb-1 bg-gray-200 px-3 py-1.5 text-xs outline-none">
                    <label className="text-gray-600">정렬:</label>
                    <select
                        className="px-2 py-1 border border-gray-300 rounded text-xs outline-none"
                        value={dailySortBy}
                        onChange={(e) => {
                            setDailySortBy(e.target.value);
                            setDailyPage(1);
                        }}
                    >
                        <option value="questions">문제수</option>
                        <option value="uploads">업로드수</option>
                        <option value="last">최근업로드</option>
                    </select>
                    <select
                        className="px-2 py-1 border border-gray-300 rounded outline-none"
                        value={dailyOrder}
                        onChange={(e) => {
                            setDailyOrder(e.target.value);
                            setDailyPage(1);
                        }}
                    >
                        <option value="desc">내림차순</option>
                        <option value="asc">오름차순</option>
                    </select>

                    <div className="ml-auto flex items-center gap-2">
                        <button
                            className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                            onClick={() => setDailyPage((p) => Math.max(1, p - 1))}
                            disabled={dailyPage <= 1}
                        >
                            이전
                        </button>
                        <button
                            className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                            onClick={() => setDailyPage((p) => Math.min(dailyTotalPages, p + 1))}
                            disabled={dailyPage >= dailyTotalPages}
                        >
                            다음
                        </button>
                    </div>
                </div>

                {/* Page totals */}
                <div className="flex md:flex-row flex-col-reverse items-center gap-2 bg-gray-200 px-3 py-1.5 justify-between">
                    <div className="text-sm text-gray-700">
                        유저 <b>{dailyTotal}</b> · 업로드 <b>{pageUploads}</b> · 문제 <b>{pageQuestions}</b>
                        {dailyTotalPages > 1 && <em className="ml-1 text-xs text-gray-500">(현재 페이지 기준)</em>}
                    </div>

                    <div className="text-xs space-x-2">
                        <button
                            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-300"
                            onClick={() => dailyPrevDate && (setDailyDate(dailyPrevDate), setDailyPage(1))}
                            disabled={!dailyPrevDate}
                            title="이전날"
                        >
                            ← 이전날
                        </button>

                        <input
                            type="date"
                            className="px-2 py-1 border border-gray-300 rounded bg-white"
                            value={dailyDate}
                            max={TODAY_STR}
                            onChange={(e) => {
                                const v = clampToToday(e.target.value);
                                setDailyDate(v);
                                setDailyPage(1);
                            }}
                        />

                        <button
                            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-300"
                            onClick={() => {
                                if (!dailyNextDate) return;
                                const next = clampToToday(dailyNextDate);
                                if (next === dailyDate) return;
                                setDailyDate(next);
                                setDailyPage(1);
                            }}
                            disabled={!dailyNextDate || dailyDate >= TODAY_STR}
                            title="다음날"
                        >
                            다음날 →
                        </button>

                        <button
                            className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                            onClick={() => {
                                setDailyDate(TODAY_STR);
                                setDailyPage(1);
                            }}
                            disabled={dailyDate === TODAY_STR}
                            title="오늘로 이동"
                        >
                            오늘
                        </button>
                    </div>
                </div>

                {/* === User list === */}
                <div className="bg-gray-800 divide-y divide-gray-500">
                    {dailyLoading ? (
                        <div className="text-center text-gray-500 py-6">Loading…</div>
                    ) : dailyRows.length === 0 ? (
                        <div className="text-center text-gray-500 py-6">No uploads for this date.</div>
                    ) : (
                        dailyRows.map((row) => (
                            <UserCell
                                key={row.userId}
                                onFilter={goToUploads}
                                compact={true}
                                user={{
                                    _id: row.userId,
                                    name: row.userName,
                                    email: row.userEmail,
                                    profileImageUrl: row.profileImageUrl,
                                }}
                                stats={{
                                    todayUploads: row.requestCount,
                                    todayQuestions: row.totalQuestions,
                                    lifetimeUploads: row.lifetimeRequestCount,
                                    lifetimeQuestions: row.lifetimeTotalQuestions,
                                    lastAt: row.lastUploadAt,
                                }}
                                hideToggle={true}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsUsers;
