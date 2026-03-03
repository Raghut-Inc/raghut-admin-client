import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const SchoolRankingPage = () => {
    const [stats, setStats] = useState([]);
    const [locationStats, setLocationStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [schoolUsers, setSchoolUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // ✅ 1. Add Filter State
    const [filter, setFilter] = useState('all'); // 'all', 'school', 'univ'

    // ✅ 2. Filter logic for the leaderboard
    const filteredStats = useMemo(() => {
        if (filter === 'all') return stats;
        if (filter === 'univ') return stats.filter(s => s.kind?.includes('대학'));
        if (filter === 'school') return stats.filter(s => !s.kind?.includes('대학'));
        return stats;
    }, [stats, filter]);

    const totalUsersWithSchool = useMemo(() => {
        return stats.reduce((acc, curr) => acc + (curr.userCount || 0), 0);
    }, [stats]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [rankRes, locRes] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_API_URL}/analytics/schools-ranking`, { withCredentials: true }),
                    axios.get(`${process.env.REACT_APP_API_URL}/analytics/location-stats`, { withCredentials: true })
                ]);
                if (rankRes.data.success) setStats(rankRes.data.data);
                if (locRes.data.success) setLocationStats(locRes.data.data);
            } catch (err) {
                console.error("Data fetch error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSchoolClick = async (school) => {
        setSelectedSchool(school);
        setLoadingUsers(true);
        try {
            const res = await axios.get(
                `${process.env.REACT_APP_API_URL}/analytics/schools/${school.schoolId}/users`,
                { withCredentials: true }
            );
            setSchoolUsers(res.data.data);
        } catch (err) {
            console.error("User fetch error", err);
        } finally {
            setLoadingUsers(false);
        }
    };

    const openUserSearch = (username) => {
        if (!username) return;
        window.open(`/admin/search?q=${username}`, "_blank", "noopener,noreferrer");
    };

    return (
        <div className='bg-gray-50'>
            <div className="p-4 md:p-8 max-w-6xl mx-auto bg-gray-50 min-h-screen">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">학교 상황</h1>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{totalUsersWithSchool.toLocaleString()} 명 연동됨</p>
                    </div>

                    {/* ✅ 3. Segmented Control for Filtering */}
                    <div className="flex bg-gray-200 p-1 rounded-xl">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filter === 'all' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                        >전체</button>
                        <button
                            onClick={() => setFilter('school')}
                            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filter === 'school' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                        >초/중/고</button>
                        <button
                            onClick={() => setFilter('univ')}
                            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filter === 'univ' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                        >대학교</button>
                    </div>
                </div>

                {/* --- 1. Regional Distribution --- */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-1 mb-8">
                    {locationStats.map(loc => (
                        <div key={loc._id} className="bg-white p-3 py-2 rounded-xl border border-gray-200">
                            <span className="text-[12px] font-bold text-gray-400 uppercase">{loc._id || "Unknown"}</span>
                            <div className="text-xl font-black text-gray-900">{loc.count} <span className="text-xs font-normal text-gray-400">명</span></div>
                        </div>
                    ))}
                </div>

                {/* --- 2. School Leaderboard --- */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center px-2">
                        <h2 className="text-sm font-bold text-gray-400 uppercase">Ranking ({filter})</h2>
                        <span className="text-[11px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">{filteredStats.length} 건</span>
                    </div>
                    {loading ? <div className="p-10 text-center text-gray-400">Loading stats...</div> : (
                        filteredStats.map((school, index) => (
                            <TouchableOpacityRow
                                key={school.schoolId}
                                index={index}
                                school={school}
                                onClick={() => handleSchoolClick(school)}
                            />
                        ))
                    )}
                </div>

                {/* --- 3. User Detail Modal --- */}
                {selectedSchool && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setSelectedSchool(null)}
                    >
                        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="p-6 border-b flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-xl font-bold text-gray-900">{selectedSchool.name}</h2>
                                        <KindBadge kind={selectedSchool.kind} />
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium">{schoolUsers.length} 명 가입됨</p>
                                </div>
                                <button onClick={() => setSelectedSchool(null)} className="p-2 hover:bg-gray-100 rounded-full">✕</button>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                {loadingUsers ? <div className="p-20 text-center text-gray-400">Loading...</div> : (
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[10px] sticky top-0">
                                            <tr>
                                                <th className="p-4">Name</th>
                                                <th className="p-4">Username</th>
                                                <th className="p-4">Joined</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {schoolUsers.map(user => (
                                                <tr key={user._id} className="hover:bg-blue-50 cursor-pointer transition-colors group" onClick={() => openUserSearch(user.username)}>
                                                    <td className="p-4 font-semibold text-gray-900 group-hover:text-blue-600">{user.name}</td>
                                                    <td className="p-4 text-gray-500 font-mono">@{user.username}</td>
                                                    <td className="p-4 text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ✅ 4. Kind Badge Component
const KindBadge = ({ kind }) => {
    if (!kind) return null;
    const isUniv = kind.includes('대학');
    return (
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter ${isUniv ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
            }`}>
            {kind}
        </span>
    );
};

const TouchableOpacityRow = ({ index, school, onClick }) => (
    <div
        onClick={onClick}
        className="bg-white border border-gray-200 rounded-xl p-4 flex items-center shadow-sm hover:border-blue-500 cursor-pointer transition-all group"
    >
        <div className="w-8 font-black text-gray-300 group-hover:text-blue-200">{index + 1}</div>
        <div className="flex-1">
            <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{school.name}</h3>
                <KindBadge kind={school.kind} />
            </div>
            <span className="text-xs text-gray-400">{school.location}</span>
        </div>
        <div className="text-right">
            <div className="text-lg font-black text-gray-900">{school.userCount}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase">Users</div>
        </div>
    </div>
);

export default SchoolRankingPage;