import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SchoolRankingPage = () => {
    const [stats, setStats] = useState([]);
    const [locationStats, setLocationStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [schoolUsers, setSchoolUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

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

    // ✅ Helper to open admin search
    const openUserSearch = (username) => {
        if (!username) return;
        window.open(`/admin/search?q=${username}`, "_blank", "noopener,noreferrer");
    };

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-black mb-6">Growth Analytics</h1>

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
                <h2 className="text-sm font-bold text-gray-400 uppercase ml-2">School Ranking (Click to view users)</h2>
                {loading ? <div className="p-10 text-center text-gray-400">Loading stats...</div> : (
                    stats.map((school, index) => (
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
                    onClick={() => setSelectedSchool(null)} // ✅ Closes on backdrop click
                >
                    <div
                        className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl"
                        onClick={(e) => e.stopPropagation()} // ✅ Prevents close on content click
                    >
                        <div className="p-6 border-b flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{selectedSchool.name}</h2>
                                <p className="text-sm text-gray-500 font-medium">{schoolUsers.length} Students registered</p>
                            </div>
                            <button
                                onClick={() => setSelectedSchool(null)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {loadingUsers ? (
                                <div className="p-20 text-center text-gray-400">Loading student list...</div>
                            ) : (
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
                                            <tr
                                                key={user._id}
                                                className="hover:bg-blue-50 cursor-pointer transition-colors group"
                                                onClick={() => openUserSearch(user.username)} // ✅ Open search on row click
                                            >
                                                <td className="p-4 font-semibold text-gray-900 group-hover:text-blue-600">
                                                    {user.name}
                                                </td>
                                                <td className="p-4 text-gray-500 font-mono">
                                                    @{user.username}
                                                </td>
                                                <td className="p-4 text-gray-400">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </td>
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
    );
};

const TouchableOpacityRow = ({ index, school, onClick }) => (
    <div
        onClick={onClick}
        className="bg-white border border-gray-200 rounded-xl p-4 flex items-center shadow-sm hover:border-blue-500 cursor-pointer transition-all group"
    >
        <div className="w-8 font-black text-gray-300 group-hover:text-blue-200">{index + 1}</div>
        <div className="flex-1">
            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{school.name}</h3>
            <span className="text-xs text-gray-400">{school.location}</span>
        </div>
        <div className="text-right">
            <div className="text-lg font-black text-gray-900">{school.userCount}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase">Users</div>
        </div>
    </div>
);

export default SchoolRankingPage;