import React, { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

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

export default function Analytics() {
    const [userTableView, setUserTableView] = useState("monthly"); // default to monthly

    // State for users: total and monthly
    const [questionsPerUserTotal, setQuestionsPerUserTotal] = useState([]);
    const [questionsPerUserMonthly, setQuestionsPerUserMonthly] = useState([]);

    // State for guests: total and monthly
    const [questionsPerGuestTotal, setQuestionsPerGuestTotal] = useState([]);
    const [questionsPerGuestMonthly, setQuestionsPerGuestMonthly] = useState([]);

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

            // Fetch total and monthly guest stats
            fetchJson(`${API_BASE}/questions-per-guest?granularity=all`),
            fetchJson(`${API_BASE}/questions-per-guest?granularity=monthly`),
        ])
            .then(([userTotal, userMonthly, guestTotal, guestMonthly]) => {
                setQuestionsPerUserTotal(userTotal);
                setQuestionsPerUserMonthly(userMonthly);
                console.log(userMonthly)

                setQuestionsPerGuestTotal(guestTotal);
                setQuestionsPerGuestMonthly(guestMonthly);
            })
            .catch((e) => setError(e.message));
    }, []);

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
    function renderUserTable(data, title) {
        return (
            <>
                <h2 className="text-xl font-semibold mb-3 px-4">{title} (Top 30)</h2>
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

    function renderGuestTable(data, title) {
        return (
            <>
                <h2 className="text-xl font-semibold mb-3 px-4">{title} (Top 30)</h2>
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
                    {renderUserTable(questionsPerUserTotal, "전체 회원 활동")}
                    {renderGuestTable(questionsPerGuestTotal, "전체 비회원 활동")}
                </>
            );
        } else {
            return (
                <>
                    {renderUserTable(questionsPerUserMonthly, "월간 회원 활동")}
                    {renderGuestTable(questionsPerGuestMonthly, "월간 비회원 활동")}
                </>
            );
        }
    }

    return (
        <div className="w-full font-sans bg-gray-100 flex flex-col items-center">
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
                        onClick={() => setUserTableView("monthly")}
                        className={`mr-2 px-4 py-1 rounded ${userTableView === "monthly"
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-300 text-gray-700"
                            }`}
                    >
                        월간 회원 활동
                    </button>
                    <button
                        onClick={() => setUserTableView("total")}
                        className={`px-4 py-1 rounded ${userTableView === "total"
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-300 text-gray-700"
                            }`}
                    >
                        전체 회원 활동
                    </button>
                </div>

                {renderTables()}

            </div>
        </div>
    );
}
