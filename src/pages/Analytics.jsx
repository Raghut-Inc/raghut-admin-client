import { useEffect, useMemo, useState } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import NavBar from "../components/NavBar";
import { timeAgo } from "../utils/timeAgo";

// Colors + formatting
const COLORS = {
    questions: "#8884d8",       // total / cumulative
    uploads: "#82ca9d",         // requestCount / cumulative
    uniqueUploaders: "#ff7300", // uniqueUploaderCount
    signups: "#1f77b4",         // signups / cumulative
};
const LINE_WIDTH = 1.25;

const fmtShort = (n) => {
    if (n == null) return "";
    const abs = Math.abs(n);
    if (abs >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (abs >= 1_000) return (n / 1_000).toFixed(1) + "k";
    return String(n);
};

const API_BASE = `${process.env.REACT_APP_API_URL}/analytics`;

const granularityOptions = [
    { key: "all", value: "all", text: "All Time" },
    { key: "daily", value: "daily", text: "Daily" },
    { key: "weekly", value: "weekly", text: "Weekly" },
    { key: "monthly", value: "monthly", text: "Monthly" },
];

// --- Simple green heat scale for retention (0.0 -> light gray, 1.0 -> strong green)
function heatColor(p) {
    const v = Math.max(0, Math.min(1, Number.isFinite(p) ? p : 0));
    // Interpolate from #e5e7eb (gray-200) to #16a34a (green-600)
    const from = { r: 229, g: 231, b: 235 };
    const to = { r: 22, g: 163, b: 74 };
    const r = Math.round(from.r + (to.r - from.r) * v);
    const g = Math.round(from.g + (to.g - from.g) * v);
    const b = Math.round(from.b + (to.b - from.b) * v);
    return `rgb(${r}, ${g}, ${b})`;
}

export default function Analytics({ user, setUser }) {
    const [activeOverTime, setActiveOverTime] = useState([]);
    const [questionsOverTimeGranularity, setQuestionsOverTimeGranularity] = useState("daily");
    const [questionsOverTime, setQuestionsOverTime] = useState([]);
    const [signupsOverTime, setSignupsOverTime] = useState([]);

    // ONE global toggle for all cumulative series
    const [useCumulativeAll, setUseCumulativeAll] = useState(false);

    const [error, setError] = useState(null);

    // ---- DAU/WAU/MAU KPI ----
    const [engagementMode, setEngagementMode] = useState("rolling"); // 'rolling' | 'calendar'
    const [dau, setDau] = useState(0);
    const [wau, setWau] = useState(0);
    const [mau, setMau] = useState(0);
    const [ratios, setRatios] = useState({ dauWau: 0, dauMau: 0, wauMau: 0 });

    // ---- Daily uploaders (users only) ----
    const TZ = "UTC";
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

    // ---- Cohort retention ----
    const [cohortRows, setCohortRows] = useState([]); // backend rows
    const [cohortMetric, setCohortMetric] = useState("rates"); // 'rates' | 'counts'
    const [maxWeeks, setMaxWeeks] = useState(8);
    const [minCohortSize, setMinCohortSize] = useState(8);
    const [selectedCohort, setSelectedCohort] = useState("avg"); // 'avg' | cohortLabel

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

    // Signups over time series
    useEffect(() => {
        fetchJson(`${API_BASE}/signups-over-time?granularity=${questionsOverTimeGranularity}&tz=${TZ}`)
            .then(setSignupsOverTime)
            .catch((e) => setError(e.message));
    }, [questionsOverTimeGranularity]);

    // Cohort retention fetch
    useEffect(() => {
        const qs = new URLSearchParams({
            tz: TZ,
            maxWeeks: String(maxWeeks),
            minCohortSize: String(minCohortSize),
        });
        fetchJson(`${API_BASE}/weekly-cohort-retention?${qs.toString()}`)
            .then((r) => {
                setCohortRows(r?.rows || []);
            })
            .catch((e) => setError(e.message));
    }, [maxWeeks, minCohortSize]);

    // Merge series by _id + compute cumulative locally
    const merged = useMemo(() => {
        const map = new Map();
        questionsOverTime.forEach((d) => map.set(d._id, { ...d }));
        activeOverTime.forEach((a) => {
            const row = map.get(a._id) || { _id: a._id };
            row.uniqueUploaderCount = a.uniqueUploaderCount;
            map.set(a._id, row);
        });
        signupsOverTime.forEach((s) => {
            const row = map.get(s._id) || { _id: s._id };
            row.signups = s.signups;
            row.cumulativeSignups = s.cumulativeSignups; // if backend provides it
            map.set(s._id, row);
        });

        const arr = Array.from(map.values()).sort((a, b) => (a._id > b._id ? 1 : -1));

        let qSum = 0,
            uSum = 0,
            sSum = 0;
        for (const r of arr) {
            qSum += r.totalQuestions ?? 0;
            uSum += r.requestCount ?? 0;
            sSum += r.signups ?? 0;
            r.cumulativeQuestions = qSum;
            r.cumulativeUploads = uSum;
            if (typeof r.cumulativeSignups !== "number") r.cumulativeSignups = sSum;
        }
        return arr;
    }, [questionsOverTime, activeOverTime, signupsOverTime]);

    // Filter to last ~2 months for the chart
    const chartData = useMemo(() => {
        const cutoff = new Date();
        cutoff.setMonth(cutoff.getMonth() - 2);

        // Try to filter by date if _id looks like a date
        const parsed = merged.map((r) => ({ r, d: new Date(r._id) }));
        const validDates = parsed.filter((x) => !isNaN(x.d.getTime()));
        if (validDates.length >= Math.max(1, Math.floor(merged.length * 0.6))) {
            return validDates.filter((x) => x.d >= cutoff).map((x) => x.r);
        }
        // Fallback: last ~62 rows (≈ 2 months daily)
        return merged.slice(-62);
    }, [merged]);

    // ---- Cohort shaping for heatmap + line chart
    const cohortMeta = useMemo(() => {
        if (!cohortRows?.length) return { weeks: [], cohorts: [], matrixRates: [], matrixCounts: [] };

        const maxW = cohortRows.reduce((m, r) => {
            const keys = Object.keys(r.rates || {});
            const maxKey = Math.max(...keys.map((k) => Number(k)).filter((n) => Number.isFinite(n)), 0);
            return Math.max(m, maxKey);
        }, 0);

        const weeks = Array.from({ length: Math.min(maxW, maxWeeks) + 1 }, (_, i) => i);

        const cohorts = cohortRows.map((r) => ({
            label: r.cohortLabel,
            size: r.size,
            rates: r.rates || {},
            counts: r.counts || {},
        }));

        // Build dense matrices aligned to weeks
        const matrixRates = cohorts.map((c) => weeks.map((w) => c.rates?.[w] ?? 0));
        const matrixCounts = cohorts.map((c) => weeks.map((w) => c.counts?.[w] ?? 0));

        return { weeks, cohorts, matrixRates, matrixCounts };
    }, [cohortRows, maxWeeks]);

    const avgCurve = useMemo(() => {
        const { weeks, matrixRates } = cohortMeta;
        if (!weeks.length || !matrixRates.length) return [];
        return weeks.map((w, idx) => {
            let sum = 0;
            let n = 0;
            for (let r = 0; r < matrixRates.length; r++) {
                const v = matrixRates[r][idx];
                if (Number.isFinite(v)) {
                    sum += v;
                    n++;
                }
            }
            return { week: w, value: n > 0 ? sum / n : 0 };
        });
    }, [cohortMeta]);

    const selectedCurve = useMemo(() => {
        const { weeks, cohorts, matrixRates, matrixCounts } = cohortMeta;
        if (!weeks.length) return [];

        if (selectedCohort === "avg") {
            return avgCurve.map(({ week, value }) => ({ _id: week, y: value }));
        }

        const idx = cohorts.findIndex((c) => c.label === selectedCohort);
        if (idx < 0) return [];

        if (cohortMetric === "rates") {
            return weeks.map((w, j) => ({ _id: w, y: matrixRates[idx][j] || 0 }));
        } else {
            return weeks.map((w, j) => ({ _id: w, y: matrixCounts[idx][j] || 0 }));
        }
    }, [cohortMeta, selectedCohort, cohortMetric, avgCurve]);

    // Daily uploaders list (users only)
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

    // ---- Helpers for MUI X Charts
    const xTickFormatter = (str) => {
        const d = new Date(str);
        return isNaN(d.getTime()) ? String(str) : `${d.getMonth() + 1}-${d.getDate()}`;
    };

    // Series for top (big counts) and bottom (small counts)
    const seriesMain = [
        !useCumulativeAll
            ? {
                dataKey: "totalQuestions",
                label: "인식된 문제수",
                showMark: false,
                color: COLORS.questions,
                lineWidth: LINE_WIDTH,
            }
            : {
                dataKey: "cumulativeQuestions",
                label: "누적 문제수",
                showMark: false,
                color: COLORS.questions,
                lineWidth: LINE_WIDTH,
            },
        !useCumulativeAll
            ? {
                dataKey: "requestCount",
                label: "업로드 수",
                showMark: false,
                color: COLORS.uploads,
                lineWidth: LINE_WIDTH,
            }
            : {
                dataKey: "cumulativeUploads",
                label: "누적 업로드",
                showMark: false,
                color: COLORS.uploads,
                lineWidth: LINE_WIDTH,
            },
    ];

    const seriesSmall = [
        {
            dataKey: "uniqueUploaderCount",
            label: "활성 업로더(고유)",
            showMark: false,
            color: COLORS.uniqueUploaders,
            lineWidth: LINE_WIDTH,
            area: !useCumulativeAll ? true : false
        },
        !useCumulativeAll
            ? {
                dataKey: "signups",
                label: "신규 가입",
                showMark: false,
                color: COLORS.signups,
                lineWidth: LINE_WIDTH,
                area: true
            }
            : {
                dataKey: "cumulativeSignups",
                label: "누적 가입",
                showMark: false,
                color: COLORS.signups,
                lineWidth: LINE_WIDTH,
            },
    ];

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
                                <option value="rolling">Rolling</option>
                                <option value="calendar">Calendar</option>
                            </select>
                            <span className="text-gray-500 ml-2">TZ: {TZ}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="text-xs text-gray-500 mb-1">DAU</div>
                            <div className="text-3xl font-semibold">{dau}</div>
                            <div className="mt-2 text-xs text-gray-500">
                                DAU/WAU <b>{pct(ratios.dauWau || 0)}</b> · DAU/MAU <b>{pct(ratios.dauMau || 0)}</b>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="text-xs text-gray-500 mb-1">WAU</div>
                            <div className="text-3xl font-semibold">{wau}</div>
                            <div className="mt-2 text-xs text-gray-500">WAU/MAU <b>{pct(ratios.wauMau || 0)}</b></div>
                        </div>
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
                <div className="flex flex-col items-start mb-3 text-lg font-semibold mx-4">
                    <p>중요 지표</p>
                    <div className="w-full flex items-center justify-end space-x-4">
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

                        {/* ONE global cumulative toggle (MUI) */}
                        <FormControlLabel
                            className="ml-2"
                            control={
                                <Switch
                                    checked={useCumulativeAll}
                                    onChange={(e) => setUseCumulativeAll(e.target.checked)}
                                    size="small"
                                />
                            }
                            label="누적"
                        />
                    </div>
                </div>

                {/* Chart 1: Questions / Uploads */}
                <div className="mb-6">
                    <div className="text-xs text-gray-600 mb-1 px-4">질문 / 업로드</div>
                    <LineChart
                        dataset={chartData}
                        series={seriesMain}
                        sx={{ "& .MuiLineElement-root": { strokeWidth: LINE_WIDTH } }}
                        xAxis={[{ dataKey: "_id", scaleType: "point", valueFormatter: xTickFormatter }]}
                        yAxis={[{ valueFormatter: fmtShort }]}
                        height={320}
                        margin={{ top: 8, bottom: 16 }}
                        slotProps={{
                            legend: { direction: "row", position: { vertical: "top", horizontal: "right" } },
                            tooltip: { formatter: (item) => fmtShort(item.value) },
                        }}
                    />
                </div>

                {/* Chart 2: Unique uploaders / Signups */}
                <div className="mb-10">
                    <div className="text-xs text-gray-600 mb-1 px-4">고유 업로더 / 가입</div>
                    <LineChart
                        dataset={chartData}
                        series={seriesSmall}
                        sx={{ "& .MuiLineElement-root": { strokeWidth: LINE_WIDTH } }}
                        xAxis={[{ dataKey: "_id", scaleType: "point", valueFormatter: xTickFormatter }]}
                        yAxis={[{ valueFormatter: fmtShort }]}
                        height={300}
                        margin={{ top: 8, bottom: 16 }}
                        slotProps={{
                            legend: { direction: "row", position: { vertical: "top", horizontal: "right" } },
                            tooltip: { formatter: (item) => fmtShort(item.value) },
                        }}
                    />
                </div>

                {/* ===== Cohort Retention ===== */}
                <div className="mx-4 mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-semibold">주간 코호트 리텐션</h2>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            <label className="text-gray-600">표시:</label>
                            <select
                                className="px-2 py-1 border border-gray-300 rounded text-xs outline-none"
                                value={cohortMetric}
                                onChange={(e) => setCohortMetric(e.target.value)}
                            >
                                <option value="rates">비율 (%)</option>
                                <option value="counts">인원 (명)</option>
                            </select>
                            <label className="text-gray-600 ml-2">Max Weeks:</label>
                            <input
                                type="number"
                                min={0}
                                max={52}
                                className="w-16 px-2 py-1 border border-gray-300 rounded text-xs"
                                value={maxWeeks}
                                onChange={(e) => setMaxWeeks(Math.max(0, Math.min(52, Number(e.target.value) || 0)))}
                            />
                            <label className="text-gray-600 ml-2">Min Cohort:</label>
                            <input
                                type="number"
                                min={1}
                                className="w-16 px-2 py-1 border border-gray-300 rounded text-xs"
                                value={minCohortSize}
                                onChange={(e) => setMinCohortSize(Math.max(1, Number(e.target.value) || 1))}
                            />
                            <span className="text-gray-500 ml-2">TZ: {TZ}</span>
                        </div>
                    </div>

                    {/* Heatmap */}
                    <CohortHeatmap
                        rows={cohortRows}
                        metric={cohortMetric}
                        onSelectCohort={(label) => setSelectedCohort(label)}
                        selectedCohort={selectedCohort}
                    />

                    {/* Retention line chart */}
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-1">
                            <div className="text-xs text-gray-600">
                                {selectedCohort === "avg"
                                    ? "평균 리텐션 곡선"
                                    : `코호트 ${selectedCohort} 리텐션 곡선 (${cohortMetric === "rates" ? "비율" : "인원"})`}
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-500">Cohort:</label>
                                <select
                                    className="px-2 py-1 border border-gray-300 rounded text-xs outline-none"
                                    value={selectedCohort}
                                    onChange={(e) => setSelectedCohort(e.target.value)}
                                >
                                    <option value="avg">Average</option>
                                    {cohortRows.map((r) => (
                                        <option key={r.cohortLabel} value={r.cohortLabel}>
                                            {r.cohortLabel} (n={r.size})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <LineChart
                            dataset={selectedCurve}
                            series={[
                                {
                                    dataKey: "y",
                                    label:
                                        selectedCohort === "avg"
                                            ? "Avg retention"
                                            : cohortMetric === "rates"
                                                ? "Retention %"
                                                : "Active users",
                                    showMark: false,
                                    lineWidth: LINE_WIDTH,
                                },
                            ]}
                            xAxis={[{ dataKey: "_id", valueFormatter: (w) => `W${w}` }]}
                            yAxis={[
                                {
                                    valueFormatter:
                                        cohortMetric === "rates" ? (v) => `${Math.round((v || 0) * 100)}%` : fmtShort,
                                },
                            ]}
                            height={280}
                            margin={{ top: 8, bottom: 16 }}
                            slotProps={{
                                legend: { direction: "row", position: { vertical: "top", horizontal: "right" } },
                                tooltip: {
                                    formatter: (item) =>
                                        cohortMetric === "rates"
                                            ? `${Math.round((item.value || 0) * 100)}%`
                                            : fmtShort(item.value),
                                },
                            }}
                        />
                    </div>
                </div>

                {/* Daily uploaders (users only) */}
                <div className="px-4 mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-semibold">일별 활성 업로더 (고유)</h2>
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
        </div>
    )
}

/** Cohort Heatmap (CSS grid, fast & dependency-free)
 * rows: [{ cohortLabel, size, counts:{"0":n,...}, rates:{"0":p,...} }, ...]
 */
function CohortHeatmap({ rows, metric, onSelectCohort, selectedCohort }) {
    const headerStyle = "text-xs text-gray-600 px-2 py-1 whitespace-nowrap";
    const cellBase = "text-[11px] text-gray-900 text-center rounded-md cursor-pointer select-none";
    const wrap = "overflow-x-auto bg-white rounded-2xl border border-gray-200";

    const { weeks, cohorts, matrixRates, matrixCounts } = useMemo(() => {
        if (!rows?.length) return { weeks: [], cohorts: [], matrixRates: [], matrixCounts: [] };

        const maxW = rows.reduce((m, r) => {
            const keys = Object.keys((r.rates || {}));
            const mk = Math.max(...keys.map(k => +k).filter(Number.isFinite), 0);
            return Math.max(m, mk);
        }, 0);

        const weeks = Array.from({ length: maxW + 1 }, (_, i) => i);
        const cohorts = rows.map((r) => ({ label: r.cohortLabel, size: r.size, rates: r.rates, counts: r.counts }));

        const matrixRates = cohorts.map((c) => weeks.map((w) => c.rates?.[w] ?? 0));
        const matrixCounts = cohorts.map((c) => weeks.map((w) => c.counts?.[w] ?? 0));

        return { weeks, cohorts, matrixRates, matrixCounts };
    }, [rows]);

    const isRates = metric === "rates";

    return (
        <div className={wrap}>
            {/* Header */}
            <div className="min-w-[720px]">
                <div className="grid" style={{ gridTemplateColumns: `160px 72px repeat(${weeks.length}, 56px)` }}>
                    <div className={headerStyle}>Cohort (ISO week)</div>
                    <div className={`${headerStyle} text-right pr-3`}>Size</div>
                    {weeks.map((w) => (
                        <div key={`h-${w}`} className={`${headerStyle} text-center`}>W{w}</div>
                    ))}
                </div>

                {/* Rows */}
                <div className="divide-y divide-gray-100">
                    {cohorts.map((c, i) => (
                        <div
                            key={c.label}
                            className={`grid items-center ${selectedCohort === c.label ? "bg-amber-50" : ""}`}
                            style={{ gridTemplateColumns: `160px 72px repeat(${weeks.length}, 56px)` }}
                        >
                            <div
                                className="px-2 py-1 text-xs font-medium text-gray-800 truncate cursor-pointer"
                                onClick={() => onSelectCohort(selectedCohort === c.label ? "avg" : c.label)}
                                title={`${c.label} (n=${c.size}) — 클릭하여 라인차트 선택`}
                            >
                                {c.label}
                            </div>
                            <div className="px-2 py-1 text-right text-xs text-gray-600">{c.size}</div>
                            {weeks.map((w, j) => {
                                const v = isRates ? matrixRates[i][j] : matrixCounts[i][j];
                                const bg = isRates ? heatColor(v) : heatColor((v && c.size) ? v / c.size : 0);
                                const label = isRates ? `${Math.round((v || 0) * 100)}%` : `${v || 0}`;
                                return (
                                    <div
                                        key={`${c.label}-${w}`}
                                        className={`${cellBase} mx-1 my-1 px-1 py-1`}
                                        style={{ backgroundColor: bg }}
                                        title={
                                            isRates
                                                ? `${c.label} • Week ${w}\nRetention: ${Math.round((v || 0) * 100)}%`
                                                : `${c.label} • Week ${w}\nActive users: ${v || 0}`
                                        }
                                        onClick={() => onSelectCohort(c.label)}
                                    >
                                        {label}
                                    </div>
                                );
                            })}
                        </div>
                    ))}

                    {cohorts.length === 0 && (
                        <div className="px-3 py-4 text-sm text-gray-500">No cohort data.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
