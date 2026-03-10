import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, Cell, Legend
} from 'recharts';

const ReferralAnalyticsPage = () => {
    const [summary, setSummary] = useState([]);
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);

    // Dynamic colors for the various lines
    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

    useEffect(() => {
        const fetchReferralData = async () => {
            setLoading(true);
            try {
                const [summaryRes, trendRes] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_API_URL}/analytics/referral-summary`, { withCredentials: true }),
                    axios.get(`${process.env.REACT_APP_API_URL}/analytics/referral-trends?days=${days}`, { withCredentials: true })
                ]);

                if (summaryRes.data.success) setSummary(summaryRes.data.data);
                if (trendRes.data.success) setTrends(trendRes.data.data);
            } catch (err) {
                console.error("Referral data fetch error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReferralData();
    }, [days]);

    // ✅ 1. Pivot the data: Convert [{date, counts: {A:1}}] -> [{date, A:1}]
    const chartData = useMemo(() => {
        return trends.map(t => ({
            date: t.date,
            ...t.counts
        }));
    }, [trends]);

    // ✅ 2. Extract unique source keys dynamically for <Line /> components
    const sourceKeys = useMemo(() => {
        const keys = new Set();
        trends.forEach(t => {
            if (t.counts) {
                Object.keys(t.counts).forEach(key => keys.add(key));
            }
        });
        return Array.from(keys);
    }, [trends]);

    const totalUsers = useMemo(() => summary.reduce((acc, curr) => acc + curr.totalUsers, 0), [summary]);

    return (
        <div className="bg-gray-50 min-h-screen p-4 md:p-8">
            <div className="max-w-6xl mx-auto">

                {/* Header Section */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">유입 경로 분석 (Referrals)</h1>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                            {totalUsers.toLocaleString()} 유저 데이터 집계됨
                        </p>
                    </div>
                    <select
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                        className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold text-gray-600 shadow-sm outline-none focus:ring-2 ring-blue-500 transition-all cursor-pointer"
                    >
                        <option value={7}>지난 7일</option>
                        <option value={30}>지난 30일</option>
                        <option value={90}>지난 90일</option>
                    </select>
                </div>

                {/* --- 1. Multi-Line Growth Chart --- */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mb-8">
                    <div className="mb-6">
                        <h2 className="text-sm font-black text-gray-400 uppercase tracking-tighter">채널별 일일 가입 추이 (Daily Growth)</h2>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="#F1F5F9" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 700 }}
                                    labelStyle={{ marginBottom: '4px', fontWeight: 900, color: '#1E293B' }}
                                />
                                <Legend
                                    iconType="circle"
                                    wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}
                                />

                                {/* Dynamically generate a line for every source in your DB */}
                                {sourceKeys.map((source, index) => (
                                    <Line
                                        key={source}
                                        type="monotone"
                                        dataKey={source}
                                        stroke={COLORS[index % COLORS.length]}
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                        animationDuration={1000}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="flex flex-wrap gap-8">
                    {/* --- 2. Referral Quality Table --- */}
                    <div className="space-y-4">
                        <h2 className="text-sm font-black text-gray-400 uppercase px-2 tracking-tighter">소스별 성과 (Channel Performance)</h2>
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                                    <tr>
                                        <th className="p-5">Source</th>
                                        <th className="p-5">Signups</th>
                                        <th className="p-5">Paid Conv.</th>
                                        <th className="p-5 text-right">Avg Uploads</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {loading ? (
                                        <tr><td colSpan="4" className="p-20 text-center text-gray-400 animate-pulse font-bold">분석 데이터 로딩 중...</td></tr>
                                    ) : (
                                        summary.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                                                <td className="p-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-1.5 h-5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        <span className="font-bold text-gray-900">{item.source || "Direct/Unknown"}</span>
                                                    </div>
                                                </td>
                                                <td className="p-5 font-bold text-gray-500">{item.totalUsers.toLocaleString()}</td>
                                                <td className="p-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 max-w-[100px] bg-gray-100 h-2 rounded-full overflow-hidden">
                                                            <div
                                                                className="bg-emerald-500 h-full rounded-full"
                                                                style={{ width: `${Math.min(item.conversionRate, 100)}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-black text-emerald-600">{item.conversionRate.toFixed(1)}%</span>
                                                    </div>
                                                </td>
                                                <td className="p-5 text-right font-mono font-bold text-blue-600">
                                                    {item.avgLifetimeUploads}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* --- 3. Sidebar Volume Breakdown --- */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <h2 className="text-sm font-black text-gray-400 uppercase mb-4 tracking-tighter">유입 비중 (Volume Mix)</h2>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={summary.slice(0, 6)} layout="vertical" margin={{ left: -20 }}>
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="source"
                                            type="category"
                                            tick={{ fontSize: 10, fontWeight: 800, fill: '#64748B' }}
                                            width={80}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip cursor={{ fill: '#F8FAFC' }} />
                                        <Bar dataKey="totalUsers" radius={[0, 10, 10, 0]} barSize={12}>
                                            {summary.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Insight</p>
                                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                    가장 많은 유입은 <span className="text-blue-600 font-bold">{summary[0]?.source}</span> 이며,
                                    결제 전환율이 가장 높은 채널은 <span className="text-emerald-600 font-bold">
                                        {summary.sort((a, b) => b.conversionRate - a.conversionRate)[0]?.source}
                                    </span> 입니다.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReferralAnalyticsPage;