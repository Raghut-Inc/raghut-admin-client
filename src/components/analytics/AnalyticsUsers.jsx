import { useEffect, useState } from "react";
import { timeAgo } from '../../utils/timeAgo';
const API_BASE = `${process.env.REACT_APP_API_URL}/analytics`;

const AnalyticsUsers = () => {

    // ---- Daily uploaders (users only) ----
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
    const [dailySortBy, setDailySortBy] = useState("questions"); // 'questions' | 'uploads' | 'last'
    const [dailyOrder, setDailyOrder] = useState("desc"); // 'asc' | 'desc'
    const [dailyLoading, setDailyLoading] = useState(false);

    const [, setError] = useState(null);

    function clampToToday(isoDate) {
        if (!isoDate) return TODAY_STR;
        return isoDate > TODAY_STR ? TODAY_STR : isoDate;
    }

    async function fetchJson(url) {
        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
        return res.json();
    }

    // Page totals (current page rows only)
    const pageUploads = dailyRows.reduce((s, r) => s + (r.requestCount || 0), 0);
    const pageQuestions = dailyRows.reduce((s, r) => s + (r.totalQuestions || 0), 0);

    // Daily uploaders list (users only)
    useEffect(() => {
        setDailyLoading(true);
        fetchJson(
            `${API_BASE}/daily-uploaders?date=${dailyDate}&tz=${TZ}&page=${dailyPage}&limit=${dailyLimit}&sortBy=${dailySortBy}&order=${dailyOrder}&includeLifetime=1`
        )
            .then((r) => {
                console.log(r.rows)
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
        < div className="flex space-x-1 p-2 w-full font-semibold items-center max-w-4xl" >
            <p className="font-semibold w-full text-gray-500">{title}</p>
            <p className="text-xs text-indigo-600 flex-shrink-0">{subtitle}</p>
        </div >
    )

    return (
        <div className="max-w-4xl w-full mx-auto mb-16 font-sans">

            <Header title={"일별 활성 업로더 (고유)"} />
            {/* Daily uploaders (users only) */}
            <div className="px-4 mb-8">
                <div className="flex flex-wrap items-center gap-2 mb-1 bg-gray-200 px-3 py-1.5 rounded-xl text-xs outline-none">
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
                <div className="flex md:flex-row flex-col-reverse items-center gap-2 bg-gray-200 rounded-xl px-3 py-1.5 justify-between">
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

                <div className="overflow-x-auto bg-white">
                    <table className="w-full border-collapse text-sm">
                        <thead className="bg-gray-100 text-gray-500 text-xs">
                            <tr>
                                <th className="border-b border-gray-300 px-4 py-2 text-left font-semibold">User</th>
                                <th className="border-b border-gray-300 px-4 py-2 text-right font-semibold">U/P</th>
                                <th className="border-b border-gray-300 px-4 py-2 text-right font-semibold">Lifetime U / P</th>
                                <th className="border-b border-gray-300 px-4 py-2 text-right font-semibold">Last Upload</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dailyLoading ? (
                                <tr>
                                    <td className="px-4 py-6 text-center text-gray-500" colSpan={6}>
                                        Loading…
                                    </td>
                                </tr>
                            ) : dailyRows.length === 0 ? (
                                <tr>
                                    <td className="px-4 py-6 text-center text-gray-500" colSpan={6}>
                                        No uploads for this date.
                                    </td>
                                </tr>
                            ) : (
                                dailyRows.map((row) => (
                                    <tr key={row.userId} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span>{row.userName || "-"}</span>
                                                <span className="text-xs text-gray-500">{row.userEmail || "-"}</span>
                                                <span className="text-xs text-gray-500">{row.userId}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            {row.requestCount}/{row.totalQuestions}
                                        </td>
                                        <td className="px-4 py-2 text-right flex-shrink-0">
                                            {`${row.lifetimeRequestCount}/${row.lifetimeTotalQuestions}`}
                                        </td>
                                        <td className="px-4 py-2 text-right text-xs">
                                            {row.lastUploadAt ? timeAgo(row.lastUploadAt) : "-"}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default AnalyticsUsers