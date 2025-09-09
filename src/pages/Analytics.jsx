import { useEffect, useMemo, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import NavBar from "../components/NavBar";
import { timeAgo } from "../utils/timeAgo";

const API_BASE = `${process.env.REACT_APP_API_URL}/analytics`;

const granularityOptions = [
    { key: "all", value: "all", text: "All Time" },
    { key: "daily", value: "daily", text: "Daily" },
    { key: "weekly", value: "weekly", text: "Weekly" },
    { key: "monthly", value: "monthly", text: "Monthly" },
];

export default function Analytics({ user, setUser }) {
    const [activeOverTime, setActiveOverTime] = useState([]);
    const [questionsOverTimeGranularity, setQuestionsOverTimeGranularity] = useState("daily");
    const [questionsOverTime, setQuestionsOverTime] = useState([]);
    const [error, setError] = useState(null);

    // ---- DAU/WAU/MAU KPI ----
    const [engagementMode, setEngagementMode] = useState("rolling"); // 'rolling' | 'calendar'
    const [dau, setDau] = useState(0);
    const [wau, setWau] = useState(0);
    const [mau, setMau] = useState(0);
    const [ratios, setRatios] = useState({ dauWau: 0, dauMau: 0, wauMau: 0 });

    // ---- Daily uploaders (users only) ----
    const TZ = "Asia/Seoul";
    const TODAY_STR = new Intl.DateTimeFormat("en-CA", {
        timeZone: TZ,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());

    function clampToToday(isoDate) {
        if (!isoDate) return TODAY_STR;
        return isoDate > TODAY_STR ? TODAY_STR : isoDate;
    }

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

    async function fetchJson(url) {
        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
        return res.json();
    }

    // Fetch DAU/WAU/MAU
    useEffect(() => {
        fetchJson(`${API_BASE}/dau-wau-mau?mode=${engagementMode}&tz=${TZ}`)
            .then((r) => {
                setDau(r.dau || 0);
                setWau(r.wau || 0);
                setMau(r.mau || 0);
                setRatios(r.ratios || { dauWau: 0, dauMau: 0, wauMau: 0 });
            })
            .catch((e) => setError(e.message));
    }, [engagementMode]);

    // Active uploaders (users only) time series
    useEffect(() => {
        const windowParam =
            questionsOverTimeGranularity === "daily"
                ? "30d"
                : questionsOverTimeGranularity === "weekly"
                    ? "182d" // ~26 weeks
                    : "730d"; // ~24 months

        fetchJson(
            `${API_BASE}/active-uploaders-over-time?granularity=${questionsOverTimeGranularity}&window=${windowParam}`
        )
            .then(setActiveOverTime)
            .catch((e) => setError(e.message));
    }, [questionsOverTimeGranularity]);

    // Questions over time series
    useEffect(() => {
        fetchJson(`${API_BASE}/questions-over-time?granularity=${questionsOverTimeGranularity}`)
            .then(setQuestionsOverTime)
            .catch((e) => setError(e.message));
    }, [questionsOverTimeGranularity]);

    // Merge series by _id for chart
    const merged = useMemo(() => {
        const map = new Map();
        questionsOverTime.forEach((d) => map.set(d._id, { ...d }));
        activeOverTime.forEach((a) => {
            const row = map.get(a._id) || { _id: a._id };
            row.uniqueUploaderCount = a.uniqueUploaderCount;
            map.set(a._id, row);
        });
        return Array.from(map.values()).sort((a, b) => (a._id > b._id ? 1 : -1));
    }, [questionsOverTime, activeOverTime]);

    // Daily uploaders list (users only) — request lifetime aggregates too (backend may ignore safely)
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

    if (error)
        return (
            <div className="max-w-4xl mx-auto mt-12 p-6 bg-red-100 border border-red-400 rounded-md text-red-700">
                <h2 className="text-2xl font-semibold mb-2">Error loading analytics</h2>
                <p>{error}</p>
            </div>
        );

    // Page totals (current page rows only)
    const pageUploads = dailyRows.reduce((s, r) => s + (r.requestCount || 0), 0);
    const pageQuestions = dailyRows.reduce((s, r) => s + (r.totalQuestions || 0), 0);

    const pct = (x) => `${(x * 100).toFixed(0)}%`;

    return (
        <div className="w-full font-sans bg-gray-100 flex flex-col items-center min-h-screen">
            <NavBar user={user} setUser={setUser} animate={true} title={"분석"} />
            <div className="max-w-4xl w-full mx-auto mt-4 mb-16 font-sans">

                {/* ===== KPI Bar: DAU / WAU / MAU ===== */}
                <div className="mx-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-semibold">활성 지표</h2>
                        <div className="flex items-center gap-2 text-xs">
                            <select
                                className="px-2 py-1 border border-gray-300 rounded text-xs outline-none"
                                value={engagementMode}
                                onChange={(e) => setEngagementMode(e.target.value)}
                            >
                                {/* (1/7/30일) */}
                                <option value="rolling">Rolling</option>
                                {/* 오늘/이번주/이번달 */}
                                <option value="calendar">Calendar</option>
                            </select>
                            <span className="text-gray-500 ml-2">TZ: {TZ}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* DAU */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="text-xs text-gray-500 mb-1">DAU</div>
                            <div className="text-3xl font-semibold">{dau}</div>
                            <div className="mt-2 text-xs text-gray-500">
                                DAU/WAU <b>{pct(ratios.dauWau || 0)}</b> · DAU/MAU <b>{pct(ratios.dauMau || 0)}</b>
                            </div>
                        </div>
                        {/* WAU */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="text-xs text-gray-500 mb-1">WAU</div>
                            <div className="text-3xl font-semibold">{wau}</div>
                            <div className="mt-2 text-xs text-gray-500">
                                WAU/MAU <b>{pct(ratios.wauMau || 0)}</b>
                            </div>
                        </div>
                        {/* MAU */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="text-xs text-gray-500 mb-1">MAU</div>
                            <div className="text-3xl font-semibold">{mau}</div>
                            <div className="mt-2 text-xs text-gray-500">
                                {engagementMode === "rolling" ? "최근 30일" : "이번 달"} 활성 사용자
                            </div>
                        </div>
                    </div>
                </div>

                {/* Header with Dropdown */}
                <div className="flex items-center mb-3 text-lg font-semibold mx-4">
                    유저 / 업로드 / 문제수
                    <select
                        value={questionsOverTimeGranularity}
                        onChange={(e) => setQuestionsOverTimeGranularity(e.target.value)}
                        className="ml-4 px-3 py-1 border border-gray-300 rounded-md cursor-pointer text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                        {granularityOptions.map(({ key, value, text }) => (
                            <option key={key} value={value}>
                                {text}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Chart */}
                <div className="h-96 mb-10 text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={merged} margin={{ top: 10, right: 20, left: -24, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="_id"
                                tickFormatter={(str) => {
                                    const d = new Date(str);
                                    return isNaN(d.getTime()) ? String(str) : `${d.getMonth() + 1}-${d.getDate()}`;
                                }}
                            />
                            <YAxis />
                            <Tooltip
                                labelFormatter={(label) => `Date: ${label}`}
                                formatter={(value, name) => [
                                    value,
                                    name === "totalQuestions" ? "Total Questions" : name,
                                ]}
                            />
                            <Line type="monotone" dataKey="totalQuestions" stroke="#8884d8" name="인식된 문제수" dot={false} />
                            <Line type="monotone" dataKey="requestCount" stroke="#82ca9d" name="업로드 수" dot={false} />
                            <Line type="monotone" dataKey="uniqueUploaderCount" stroke="#ff7300" name="활성 업로더(고유)" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Daily uploaders (users only) */}
                <div className="px-4 mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-semibold">일별 업로더 (회원)</h2>
                    </div>

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
                            {dailyTotalPages > 1 && (
                                <em className="ml-1 text-xs text-gray-500">(현재 페이지 기준)</em>
                            )}
                        </div>

                        <div className="text-sm space-x-2">
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
                                className="px-2 py-1 border border-gray-300 rounded"
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
        </div>
    );
}
