import { useEffect, useMemo, useState } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

const API_BASE = `${process.env.REACT_APP_API_URL}/analytics`;
const TZ = "UTC";

// === COLORS / STYLES ===
const COLORS = {
    questions: "#8884d8",
    uploads: "#82ca9d",
    uniqueUploaders: "#ff7300",
    signups: "#1f77b4",
};
const LINE_WIDTH = 1.25;

// === HELPERS ===
const fmtShort = (n) => {
    if (n == null) return "";
    const abs = Math.abs(n);
    if (abs >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (abs >= 1_000) return (n / 1_000).toFixed(1) + "k";
    return String(n);
};
const xTickFormatter = (str) => {
    const d = new Date(str);
    return isNaN(d.getTime()) ? String(str) : `${d.getMonth() + 1}-${d.getDate()}`;
};
const fmtHour = (d) =>
    d instanceof Date && !isNaN(d)
        ? `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:00`
        : "";

// --- green heat scale 0–1 ---
const heatColor = (p) => {
    const v = Math.max(0, Math.min(1, Number.isFinite(p) ? p : 0));
    const from = { r: 229, g: 231, b: 235 }, to = { r: 22, g: 163, b: 74 };
    const r = Math.round(from.r + (to.r - from.r) * v);
    const g = Math.round(from.g + (to.g - from.g) * v);
    const b = Math.round(from.b + (to.b - from.b) * v);
    return `rgb(${r},${g},${b})`;
};

const granularityOptions = [
    { key: "daily", text: "Daily" },
    { key: "weekly", text: "Weekly" },
    { key: "monthly", text: "Monthly" },
];

// ===================================================
// MAIN COMPONENT
// ===================================================
export default function AnalyticsChart() {
    const [granularity, setGranularity] = useState("daily");
    const [useCumulative, setUseCumulative] = useState(false);
    const [windowDays, setWindowDays] = useState(30); // default 1 month
    const [active, setActive] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [signups, setSignups] = useState([]);
    const [hourly, setHourly] = useState([]);
    const [cohortRows, setCohortRows] = useState([]);
    const [cohortMetric, setCohortMetric] = useState("rates");
    const [maxWeeks, setMaxWeeks] = useState(12);
    const [minCohortSize, setMinCohortSize] = useState(1);
    const [selectedCohort, setSelectedCohort] = useState("avg");
    const [, setError] = useState(null);

    const fetchJson = async (url) => {
        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) throw new Error(`${url}: ${res.statusText}`);
        return res.json();
    };

    // === FETCHES ===
    useEffect(() => {
        const windowParam =
            granularity === "daily" ? "365d" : granularity === "weekly" ? "730d" : "1460d";
        Promise.all([
            fetchJson(`${API_BASE}/active-uploaders-over-time?granularity=${granularity}&window=${windowParam}`),
            fetchJson(`${API_BASE}/questions-over-time?granularity=${granularity}`),
            fetchJson(`${API_BASE}/signups-over-time?granularity=${granularity}&tz=${TZ}`),
            fetchJson(`${API_BASE}/active-uploaders-over-time?granularity=hourly&window=168h&tz=${TZ}`),
        ])
            .then(([a, q, s, h]) => {
                setActive(a || []);
                setQuestions(q || []);
                setSignups(s || []);
                setHourly(h || []);
            })
            .catch((e) => setError(e.message));
    }, [granularity]);

    useEffect(() => {
        const qs = new URLSearchParams({ tz: TZ, maxWeeks, minCohortSize });
        fetchJson(`${API_BASE}/weekly-cohort-retention?${qs}`)
            .then((r) => setCohortRows(r?.rows || []))
            .catch((e) => setError(e.message));
    }, [maxWeeks, minCohortSize]);

    // === MERGED DATASETS ===
    const mergedAll = useMemo(() => {
        const map = new Map();
        questions.forEach((d) => map.set(d._id, { ...d }));
        active.forEach((a) => {
            const r = map.get(a._id) || { _id: a._id };
            r.uniqueUploaderCount = a.uniqueUploaderCount;
            map.set(a._id, r);
        });
        signups.forEach((s) => {
            const r = map.get(s._id) || { _id: s._id };
            r.signups = s.signups;
            r.cumulativeSignups = s.cumulativeSignups;
            map.set(s._id, r);
        });
        const arr = Array.from(map.values()).sort((a, b) => (a._id > b._id ? 1 : -1));
        let qSum = 0, uSum = 0, sSum = 0;
        for (const r of arr) {
            qSum += r.totalQuestions ?? 0;
            uSum += r.requestCount ?? 0;
            sSum += r.signups ?? 0;
            r.cumulativeQuestions = qSum;
            r.cumulativeUploads = uSum;
            if (typeof r.cumulativeSignups !== "number") r.cumulativeSignups = sSum;
        }
        return arr;
    }, [questions, active, signups]);

    // 🆕 Filter by windowDays
    const merged = useMemo(() => {
        if (!windowDays) return mergedAll;

        // 🧠 Only apply cutoff for daily mode
        if (granularity !== "daily") return mergedAll;

        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - windowDays);

        return mergedAll.filter((r) => {
            const d = new Date(r._id);
            return !isNaN(d) && d >= cutoff;
        });
    }, [mergedAll, windowDays, granularity]);


    const hourlyDataset = useMemo(() => {
        const now = new Date(); now.setMinutes(0, 0, 0);
        const start = new Date(now.getTime() - 168 * 3600_000);
        const map = new Map(hourly.map((r) => [new Date(r.ts || r._id).getTime(), r.uniqueUploaderCount || 0]));
        const out = [];
        for (let t = start.getTime(); t <= now.getTime(); t += 3600_000)
            out.push({ ts: new Date(t), uniqueUploaderCount: map.get(t) ?? 0 });
        return out;
    }, [hourly]);

    // === SERIES CONFIGS ===
    const seriesMain = [
        {
            dataKey: useCumulative ? "cumulativeQuestions" : "totalQuestions",
            label: useCumulative ? "누적 문제수" : "인식된 문제수",
            color: COLORS.questions,
            showMark: false,
            lineWidth: LINE_WIDTH,
        },
        {
            dataKey: useCumulative ? "cumulativeUploads" : "requestCount",
            label: useCumulative ? "누적 업로드" : "업로드 수",
            color: COLORS.uploads,
            showMark: false,
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
            area: !useCumulative,
        },
        {
            dataKey: useCumulative ? "cumulativeSignups" : "signups",
            label: useCumulative ? "누적 가입" : "신규 가입",
            showMark: false,
            color: COLORS.signups,
            lineWidth: LINE_WIDTH,
            area: !useCumulative,
        },
    ];

    // === COHORT META ===
    const cohortMeta = useMemo(() => {
        if (!cohortRows?.length)
            return { weeks: [], cohorts: [], matrixRates: [], matrixCounts: [], lastWeekIdx: [] };
        const maxW = cohortRows.reduce(
            (m, r) =>
                Math.max(m, Math.max(...Object.keys(r.rates || {}).map(Number).filter(Number.isFinite), 0)),
            0
        );
        const weeks = Array.from({ length: Math.min(maxW, maxWeeks) + 1 }, (_, i) => i);
        const cohorts = cohortRows.map((r) => ({
            label: r.cohortLabel,
            size: r.size,
            rates: r.rates || {},
            counts: r.counts || {},
        }));
        const matrixRates = cohorts.map((c) => weeks.map((w) => c.rates[w] ?? null));
        const matrixCounts = cohorts.map((c) => weeks.map((w) => c.counts[w] ?? null));
        const lastWeekIdx = matrixCounts.map((row) => row.findLastIndex(Number.isFinite));
        return { weeks, cohorts, matrixRates, matrixCounts, lastWeekIdx };
    }, [cohortRows, maxWeeks]);

    const avgCurve = useMemo(() => {
        const { weeks, matrixRates, lastWeekIdx } = cohortMeta;
        return weeks.map((w, idx) => {
            let sum = 0, n = 0;
            for (let r = 0; r < matrixRates.length; r++) {
                if (lastWeekIdx[r] === idx) continue;
                const v = matrixRates[r][idx];
                if (typeof v === "number") {
                    sum += v;
                    n++;
                }
            }
            return { week: w, value: n ? sum / n : null };
        });
    }, [cohortMeta]);

    const selectedCurve = useMemo(() => {
        const { weeks, cohorts, matrixRates, matrixCounts, lastWeekIdx } = cohortMeta;
        if (selectedCohort === "avg")
            return avgCurve.map(({ week, value }) => ({ _id: week, y: value }));
        const idx = cohorts.findIndex((c) => c.label === selectedCohort);
        if (idx < 0) return [];
        const matrix = cohortMetric === "rates" ? matrixRates : matrixCounts;
        return weeks.map((w, j) => ({
            _id: w,
            y: lastWeekIdx[idx] === j ? null : matrix[idx][j],
        }));
    }, [cohortMeta, selectedCohort, cohortMetric, avgCurve]);

    // ===================================================
    // RENDER
    // ===================================================
    return (
        <div className="max-w-4xl w-full mx-auto pb-16 font-sans">
            {/* --- Controls --- */}
            <div className="flex justify-end mb-3 space-x-3 bg-gray-200 p-2 text-xs">
                <div className="flex items-center space-x-1 text-sm">
                    <span className="text-gray-600">최근</span>
                    <input
                        type="number"
                        min="1"
                        max="365"
                        value={windowDays}
                        onChange={(e) => setWindowDays(Math.max(1, Math.min(365, +e.target.value || 30)))}
                        className="w-14 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                    />
                    <span className="text-gray-600">일</span>
                </div>

                <select
                    value={granularity}
                    onChange={(e) => setGranularity(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-base"
                >
                    {granularityOptions.map((o) => (
                        <option key={o.key} value={o.key}>
                            {o.text}
                        </option>
                    ))}
                </select>

                <FormControlLabel
                    control={
                        <Switch
                            checked={useCumulative}
                            onChange={(e) => setUseCumulative(e.target.checked)}
                            size="small"
                        />
                    }
                    label="누적"
                />
            </div>

            {/* --- Chart 1 --- */}
            <ChartBlock title="질문 / 업로드" data={merged} series={seriesMain} />

            {/* --- Chart 2 --- */}
            <ChartBlock title="고유 업로더 / 가입" data={merged} series={seriesSmall} />

            {/* --- Chart 3 --- */}
            <ChartBlock
                title="최근 168시간 업로더 (시간별)"
                data={hourlyDataset}
                series={[
                    {
                        dataKey: "uniqueUploaderCount",
                        label: "시간별 고유 업로더",
                        showMark: false,
                        color: COLORS.uniqueUploaders,
                        lineWidth: LINE_WIDTH,
                        area: true,
                    },
                ]}
                xAxisKey="ts"
                timeScale
                tickNum={12}
            />

            {/* --- Cohort Section (✅ fixed) --- */}
            <CohortSection
                {...{
                    TZ,
                    cohortRows,
                    cohortMetric,
                    maxWeeks,
                    minCohortSize,
                    setCohortMetric,
                    setMaxWeeks,
                    setMinCohortSize,
                    setSelectedCohort,
                    selectedCohort,
                    selectedCurve,
                }}
            />
        </div>
    );
}

// === SUBCOMPONENTS ===
const Header = ({ title }) => (
    <div className="flex space-x-1 p-2 w-full font-semibold items-center max-w-4xl">
        <p className="font-semibold w-full text-gray-500">{title}</p>
    </div>
);

const ChartBlock = ({ title, data, series, xAxisKey = "_id", timeScale, tickNum }) => (
    <div className="mb-8">
        <Header title={title} />
        <LineChart
            dataset={data}
            series={series}
            sx={{ "& .MuiLineElement-root": { strokeWidth: LINE_WIDTH } }}
            xAxis={[
                timeScale
                    ? { dataKey: xAxisKey, scaleType: "time", valueFormatter: fmtHour, tickNumber: tickNum }
                    : { dataKey: xAxisKey, scaleType: "point", valueFormatter: xTickFormatter },
            ]}
            yAxis={[{ valueFormatter: fmtShort }]}
            height={300}
            margin={{ top: 8, bottom: 16, left: -4 }}
            slotProps={{
                legend: { direction: "row", position: { vertical: "top", horizontal: "right" } },
                tooltip: { formatter: (i) => fmtShort(i.value) },
            }}
        />
    </div>
);

function CohortSection({
    TZ,
    cohortRows,
    cohortMetric,
    maxWeeks,
    minCohortSize,
    setCohortMetric,
    setMaxWeeks,
    setMinCohortSize,
    setSelectedCohort,
    selectedCohort,
    selectedCurve,
}) {
    return (
        <div className="mb-8">
            <Header title="주간 코호트 리텐션" />

            <div className="flex items-center justify-between mb-2">
                <div className="flex flex-wrap items-center gap-2 text-xs px-2">
                    <label>표시:</label>
                    <select
                        className="px-2 py-1 border border-gray-300 rounded text-xs"
                        value={cohortMetric}
                        onChange={(e) => setCohortMetric(e.target.value)}
                    >
                        <option value="rates">비율 (%)</option>
                        <option value="counts">인원 (명)</option>
                    </select>
                    <label className="ml-2">Max Weeks:</label>
                    <input
                        type="number"
                        className="w-14 px-2 py-1 border border-gray-300 rounded text-xs"
                        value={maxWeeks}
                        onChange={(e) => setMaxWeeks(Math.max(0, Math.min(52, +e.target.value || 0)))}
                    />
                    <label className="ml-2">Min Cohort:</label>
                    <input
                        type="number"
                        className="w-14 px-2 py-1 border border-gray-300 rounded text-xs"
                        value={minCohortSize}
                        onChange={(e) => setMinCohortSize(Math.max(1, +e.target.value || 1))}
                    />
                    <span className="text-gray-500 ml-2">TZ: {TZ}</span>
                </div>
            </div>
            <CohortHeatmap
                rows={cohortRows}
                metric={cohortMetric}
                onSelectCohort={setSelectedCohort}
                selectedCohort={selectedCohort}
            />
            <div className="mt-6">
                <Header title={selectedCohort === "avg"
                    ? "평균 리텐션 곡선"
                    : `코호트 ${selectedCohort} (${cohortMetric === "rates" ? "비율" : "인원"})`} />

                <LineChart
                    dataset={selectedCurve}
                    series={[{ dataKey: "y", showMark: false, lineWidth: LINE_WIDTH }]}
                    xAxis={[{ dataKey: "_id", valueFormatter: (w) => `W${w}` }]}
                    yAxis={[
                        {
                            valueFormatter:
                                cohortMetric === "rates"
                                    ? (v) => `${Math.round((v || 0) * 100)}%`
                                    : fmtShort,
                        },
                    ]}
                    height={280}
                    margin={{ top: 8, bottom: 16, left: -4 }}
                />
            </div>
        </div>
    );
}

// === HEATMAP ===
function CohortHeatmap({ rows, metric, onSelectCohort, selectedCohort }) {
    const headerStyle = "text-xs text-gray-600 px-2 py-1";
    const cellBase = "text-[11px] text-gray-900 text-center rounded-md cursor-pointer";
    const { weeks, cohorts, matrixRates, matrixCounts } = useMemo(() => {
        if (!rows?.length) return { weeks: [], cohorts: [], matrixRates: [], matrixCounts: [] };
        const maxW = rows.reduce(
            (m, r) => Math.max(m, Math.max(...Object.keys(r.rates || {}).map(Number).filter(Number.isFinite), 0)),
            0
        );
        const weeks = Array.from({ length: maxW + 1 }, (_, i) => i);
        const cohorts = rows.map((r) => ({
            label: r.cohortLabel,
            size: r.size,
            rates: r.rates,
            counts: r.counts,
        }));
        const matrixRates = cohorts.map((c) => weeks.map((w) => c.rates?.[w] ?? 0));
        const matrixCounts = cohorts.map((c) => weeks.map((w) => c.counts?.[w] ?? 0));
        return { weeks, cohorts, matrixRates, matrixCounts };
    }, [rows]);

    const isRates = metric === "rates";

    return (
        <div className="overflow-x-auto bg-white">
            <div className="min-w-[720px]">
                <div className="grid" style={{ gridTemplateColumns: `90px 42px repeat(${weeks.length}, 56px)` }}>
                    <div className={headerStyle}>Cohort</div>
                    <div className={`${headerStyle} text-right pr-3`}>Size</div>
                    {weeks.map((w) => (
                        <div key={w} className={`${headerStyle} text-center`}>
                            W{w}
                        </div>
                    ))}
                </div>
                <div className="divide-y divide-gray-100">
                    {cohorts.map((c, i) => (
                        <div
                            key={c.label}
                            className={`grid items-center ${selectedCohort === c.label ? "bg-amber-50" : ""}`}
                            style={{ gridTemplateColumns: `90px 42px repeat(${weeks.length}, 56px)` }}
                        >
                            <div
                                className="px-2 py-1 text-xs font-medium truncate cursor-pointer"
                                onClick={() => onSelectCohort(selectedCohort === c.label ? "avg" : c.label)}
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
                                        onClick={() => onSelectCohort(c.label)}
                                        title={`${c.label} W${w}: ${label}`}
                                    >
                                        {label}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                    {!cohorts.length && (
                        <div className="px-3 py-4 text-sm text-gray-500">No cohort data.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
