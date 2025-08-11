import { useEffect, useState } from "react";
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

const API_BASE = `${process.env.REACT_APP_API_URL}/analytics`;

const granularityOptions = [
    { key: "all", value: "all", text: "All Time" },
    { key: "daily", value: "daily", text: "Daily" },
    { key: "weekly", value: "weekly", text: "Weekly" },
    { key: "monthly", value: "monthly", text: "Monthly" },
];

function safeId(obj, key) {
    if (!obj) return "-";
    if (typeof obj === "string") return obj;
    if (typeof obj === "object") return obj[key] ?? JSON.stringify(obj);
    return String(obj);
}

export default function Analytics({ user, setUser }) {
    const [userTableView, setUserTableView] = useState("daily"); // default to monthly
    const [activeCounts, setActiveCounts] = useState([]); // holds merged user+guest active counts per period

    // State for users: total and monthly
    const [questionsPerUserTotal, setQuestionsPerUserTotal] = useState([]);
    const [questionsPerUserMonthly, setQuestionsPerUserMonthly] = useState([]);
    const [questionsPerUserWeekly, setQuestionsPerUserWeekly] = useState([]);
    const [questionsPerUserDaily, setQuestionsPerUserDaily] = useState([]);

    // State for guests: total and monthly
    const [questionsPerGuestTotal, setQuestionsPerGuestTotal] = useState([]);
    const [questionsPerGuestMonthly, setQuestionsPerGuestMonthly] = useState([]);
    const [questionsPerGuestWeekly, setQuestionsPerGuestWeekly] = useState([]);
    const [questionsPerGuestDaily, setQuestionsPerGuestDaily] = useState([]);

    const [questionsOverTimeGranularity, setQuestionsOverTimeGranularity] = useState(
        "daily"
    );
    const [questionsOverTime, setQuestionsOverTime] = useState([]);

    const [error, setError] = useState(null);

    async function fetchJson(url) {
        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
        return res.json();
    }

    useEffect(() => {
        setError(null);
        Promise.all([
            // Fetch total and monthly user stats
            fetchJson(`${API_BASE}/questions-per-user?granularity=all`),
            fetchJson(`${API_BASE}/questions-per-user?granularity=monthly`),
            fetchJson(`${API_BASE}/questions-per-user?granularity=weekly`),
            fetchJson(`${API_BASE}/questions-per-user?granularity=daily`),

            // Fetch total and monthly guest stats
            fetchJson(`${API_BASE}/questions-per-guest?granularity=all`),
            fetchJson(`${API_BASE}/questions-per-guest?granularity=monthly`),
            fetchJson(`${API_BASE}/questions-per-guest?granularity=weekly`),
            fetchJson(`${API_BASE}/questions-per-guest?granularity=daily`),

            // Fetch combined active user+guest counts for all granularities if needed, or just the selected one
            fetchJson(`${API_BASE}/active-users-guests-per-period?granularity=monthly`),
            fetchJson(`${API_BASE}/active-users-guests-per-period?granularity=weekly`),
            fetchJson(`${API_BASE}/active-users-guests-per-period?granularity=daily`),
        ])
            .then(([
                userTotal, userMonthly, userWeekly, userDaily,
                guestTotal, guestMonthly, guestWeekly, guestDaily,
                activeMonthly, activeWeekly, activeDaily
            ]) => {
                setQuestionsPerUserTotal(userTotal);
                setQuestionsPerUserMonthly(userMonthly);
                setQuestionsPerUserWeekly(userWeekly);
                setQuestionsPerUserDaily(userDaily);

                setQuestionsPerGuestTotal(guestTotal);
                setQuestionsPerGuestMonthly(guestMonthly);
                setQuestionsPerGuestWeekly(guestWeekly);
                setQuestionsPerGuestDaily(guestDaily);

                setActiveCounts(activeDaily);
            })
            .catch((e) => setError(e.message));
    }, []);

    useEffect(() => {
        switch (userTableView) {
            case "daily":
                fetchJson(`${API_BASE}/active-users-guests-per-period?granularity=daily`).then(setActiveCounts).catch((e) => setError(e.message));
                break;
            case "weekly":
                fetchJson(`${API_BASE}/active-users-guests-per-period?granularity=weekly`).then(setActiveCounts).catch((e) => setError(e.message));
                break;
            case "monthly":
                fetchJson(`${API_BASE}/active-users-guests-per-period?granularity=monthly`).then(setActiveCounts).catch((e) => setError(e.message));
                break;
            default:
                // For "total" you may want to fetch active counts for all time or skip
                setActiveCounts([]);
        }
    }, [userTableView]);

    useEffect(() => {
        fetchJson(
            `${API_BASE}/questions-over-time?granularity=${questionsOverTimeGranularity}`
        )
            .then(setQuestionsOverTime)
            .catch((e) => setError(e.message));
    }, [questionsOverTimeGranularity]);

    if (error)
        return (
            <div className="max-w-4xl mx-auto mt-12 p-6 bg-red-100 border border-red-400 rounded-md text-red-700">
                <h2 className="text-2xl font-semibold mb-2">Error loading analytics</h2>
                <p>{error}</p>
            </div>
        );

    // Helper table render function
    function renderUserTable(data) {
        return (
            <>
                <h2 className="text-xl font-semibold mb-3 px-4">회원 · top30 · {userTableView}</h2>
                <div className="overflow-x-auto bg-white mb-10">
                    <table className="w-full border-collapse text-sm">
                        <thead className="bg-gray-100 text-gray-500 text-xs">
                            <tr>
                                <th className="border-b border-gray-300 px-4 py-2 text-left font-semibold">User</th>
                                <th className="border-b border-gray-300 px-4 py-2 text-left font-semibold">Subs</th>
                                <th className="border-b border-gray-300 px-4 py-2 text-right font-semibold">Qst.</th>
                                <th className="border-b border-gray-300 px-4 py-2 text-right font-semibold">Rq.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(
                                ({
                                    _id,
                                    userName,
                                    userEmail,
                                    subscriptionStatus,
                                    totalQuestions,
                                    requestCount,
                                }) => (
                                    <tr
                                        key={`${safeId(_id, "userId")}-${_id.period ?? "all"}`}
                                        className="border-b border-gray-200 hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-2 whitespace-nowrap w-64">
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <p>{userName || "-"}</p>
                                                </div>
                                                <p className="text-xs text-gray-500">{userEmail || "-"}</p>
                                                <p className="text-xs text-gray-500">{safeId(_id, "userId")}</p>
                                            </div>
                                        </td>
                                        <td className="px-4">
                                            <span
                                                className={`inline-block px-2 py-0.5 rounded-full font-mono text-xs ${{
                                                    active: "bg-green-200 text-green-800",
                                                    canceled: "bg-yellow-200 text-yellow-800",
                                                    expired: "bg-red-200 text-red-800",
                                                    none: "bg-gray-300 text-gray-700",
                                                }[subscriptionStatus || "none"]
                                                    }`}
                                                title="Subscription status"
                                            >
                                                {subscriptionStatus || "none"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-right">{totalQuestions}</td>
                                        <td className="px-4 py-2 text-right">{requestCount}</td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </>
        );
    }

    function renderGuestTable(data) {
        return (
            <>
                <h2 className="text-xl font-semibold mb-3 px-4">비회원 · top30 · {userTableView}</h2>
                <div className="overflow-x-auto bg-white mb-10">
                    <table className="w-full border-collapse text-sm">
                        <thead className="bg-gray-100 text-gray-500 text-xs">
                            <tr>
                                <th className="border-b border-gray-300 px-4 py-2 text-left font-semibold">GuestId</th>
                                <th className="border-b border-gray-300 px-4 py-2 text-right font-semibold">Qst.</th>
                                <th className="border-b border-gray-300 px-4 py-2 text-right font-semibold">Rq.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(({ _id, totalQuestions, requestCount }, idx) => (
                                <tr
                                    key={`${safeId(_id, "guestUUID")}-${idx}`}
                                    className="border-b border-gray-200 hover:bg-gray-50"
                                >
                                    <td className="px-4 py-2 font-mono whitespace-nowrap text-xs">
                                        {safeId(_id, "guestUUID")}
                                    </td>
                                    <td className="px-4 py-2 text-right">{totalQuestions}</td>
                                    <td className="px-4 py-2 text-right">{requestCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </>
        );
    }

    function renderTables() {
        if (userTableView === "total") {
            return (
                <>
                    {renderUserTable(questionsPerUserTotal)}
                    {renderGuestTable(questionsPerGuestTotal)}
                </>
            );
        } else if (userTableView === "monthly") {
            return (
                <>
                    {renderUserTable(questionsPerUserMonthly)}
                    {renderGuestTable(questionsPerGuestMonthly)}
                </>
            );
        } else if (userTableView === "weekly") {
            return (
                <>
                    {renderUserTable(questionsPerUserWeekly)}
                    {renderGuestTable(questionsPerGuestWeekly)}
                </>
            );
        } else {
            return (
                <>
                    {renderUserTable(questionsPerUserDaily)}
                    {renderGuestTable(questionsPerGuestDaily)}
                </>
            );
        }
    }

    return (
        <div className="w-full font-sans bg-gray-100 flex flex-col items-center">
            <NavBar user={user} setUser={setUser} animate={true} title={"분석"} />
            <div className="max-w-4xl w-full mx-auto mt-4 mb-16 font-sans">
                {/* Header with Dropdown */}
                <div className="flex items-center mb-3 text-lg font-semibold mx-4">
                    문제 / 사진 업로드 추이
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
                        <LineChart
                            data={questionsOverTime}
                            margin={{ top: 10, right: 20, left: -24, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="_id"
                                tickFormatter={(str) => {
                                    const date = new Date(str);
                                    return `${date.getMonth() + 1}-${date.getDate()}`;
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
                            <Line
                                type="monotone"
                                dataKey="totalQuestions"
                                stroke="#8884d8"
                                name="인식된 문제수"
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="requestCount"
                                stroke="#82ca9d"
                                name="업로드 수"
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="mb-4 px-4">
                    <button
                        onClick={() => setUserTableView("daily")}
                        className={`mr-2 px-4 py-1 rounded ${userTableView === "daily"
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-300 text-gray-700"
                            }`}
                    >
                        24시간
                    </button>
                    <button
                        onClick={() => setUserTableView("weekly")}
                        className={`mr-2 px-4 py-1 rounded ${userTableView === "weekly"
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-300 text-gray-700"
                            }`}
                    >
                        7일
                    </button>
                    <button
                        onClick={() => setUserTableView("monthly")}
                        className={`mr-2 px-4 py-1 rounded ${userTableView === "monthly"
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-300 text-gray-700"
                            }`}
                    >
                        30일
                    </button>
                    <button
                        onClick={() => setUserTableView("total")}
                        className={`px-4 py-1 rounded ${userTableView === "total"
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-300 text-gray-700"
                            }`}
                    >
                        전체
                    </button>
                </div>

                {userTableView !== "total" && (
                    <>
                        <h2 className="text-xl font-semibold mb-3 px-4">활성 사용자 · {userTableView}</h2>
                        <div className="overflow-x-auto bg-white mb-10">
                            <table className="w-full border-collapse text-sm">
                                <thead className="bg-gray-100 text-gray-500 text-xs">
                                    <tr>
                                        <th className="border-b border-gray-300 px-4 py-2 text-left font-semibold">Period</th>
                                        <th className="border-b border-gray-300 px-4 py-2 text-right font-semibold">Users</th>
                                        <th className="border-b border-gray-300 px-4 py-2 text-right font-semibold">Guests</th>
                                        <th className="border-b border-gray-300 px-4 py-2 text-right font-semibold">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeCounts.map(({ period, uniqueUserCount, uniqueGuestCount, totalUniqueCount }) => (
                                        <tr key={period} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="px-4 py-2 font-mono whitespace-nowrap text-xs">{period}</td>
                                            <td className="px-4 py-2 text-right">{uniqueUserCount}</td>
                                            <td className="px-4 py-2 text-right">{uniqueGuestCount}</td>
                                            <td className="px-4 py-2 text-right">{totalUniqueCount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {renderTables()}
            </div>
        </div>
    );
}
