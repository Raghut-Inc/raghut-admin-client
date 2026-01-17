import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const UserInputsPage = () => {
    // --- State ---
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    // Filter State
    const [activeFilters, setActiveFilters] = useState({
        school: false,
        birthday: false,
        explanation: false,
        followUp: false
    });

    // --- Fetch Logic ---
    const fetchUsers = useCallback(async (targetPage, term, currentFilters) => {
        setLoading(true);
        try {
            const params = {
                page: targetPage,
                limit: 20,
                search: term,
                ...currentFilters
            };

            const res = await axios.get(
                `${process.env.REACT_APP_API_URL}/analytics/user-inputs`,
                { params, withCredentials: true }
            );

            if (res.data.success) {
                setUsers(res.data.data);
                setTotalPages(res.data.pagination.pages);
                setPage(targetPage);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers(1, '', activeFilters);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // --- Handlers ---
    const toggleFilter = (key) => {
        const newFilters = { ...activeFilters, [key]: !activeFilters[key] };
        setActiveFilters(newFilters);
        fetchUsers(1, searchTerm, newFilters);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers(1, searchTerm, activeFilters);
    };

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
            <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-900">User Data Logs</h1>

            {/* --- CONTROLS SECTION --- */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 space-y-4">
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium whitespace-nowrap">
                        Search
                    </button>
                </form>

                {/* Filter Toggles */}
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide w-full md:w-auto mb-1 md:mb-0">Filters:</span>
                    <FilterButton label="School" isActive={activeFilters.school} onClick={() => toggleFilter('school')} color="blue" />
                    <FilterButton label="Birthday" isActive={activeFilters.birthday} onClick={() => toggleFilter('birthday')} color="purple" />
                    <FilterButton label="Explain" isActive={activeFilters.explanation} onClick={() => toggleFilter('explanation')} color="emerald" />
                    <FilterButton label="FollowUp" isActive={activeFilters.followUp} onClick={() => toggleFilter('followUp')} color="orange" />
                </div>
            </div>

            {/* --- DATA DISPLAY SECTION --- */}
            <div className="bg-white border border-gray-200 shadow rounded-lg overflow-hidden">

                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading data...</div>
                ) : users.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No users found.</div>
                ) : (
                    <>
                        {/* VIEW 1: DESKTOP TABLE (Hidden on Mobile) */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">School</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Birthday</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase w-1/3">Explanation</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Follow Up</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map(user => (
                                        <tr key={user._id} className="hover:bg-gray-50 group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <InspectButton userId={user._id} />
                                                    <span className="text-xs font-mono text-gray-500">{user._id.slice(-6)}...</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{user.schoolName || <Empty />}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{user.birthday ? new Date(user.birthday).toLocaleDateString() : <Empty />}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div className="max-w-xs truncate" title={user.explanation}>{user.explanation || <Empty />}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{user.followUp || <Empty />}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* VIEW 2: MOBILE CARDS (Hidden on Desktop) */}
                        <div className="md:hidden divide-y divide-gray-100">
                            {users.map(user => (
                                <div key={user._id} className="p-4 space-y-3">
                                    {/* Card Header: ID & Button */}
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-mono font-bold text-gray-500">#{user._id.slice(-6)}</span>
                                        <InspectButton userId={user._id} mobile />
                                    </div>

                                    {/* Card Body: Data Grid */}
                                    <div className="grid grid-cols-1 gap-2 text-sm">
                                        <MobileRow label="School" value={user.schoolName} />
                                        <MobileRow label="B-Day" value={user.birthday ? new Date(user.birthday).toLocaleDateString() : null} />

                                        <div className="pt-1">
                                            <span className="text-xs font-bold text-gray-400 uppercase">Explanation:</span>
                                            <p className="text-gray-900 mt-1 bg-gray-50 p-2 rounded text-sm">
                                                {user.explanation || <span className="text-gray-300 italic">Empty</span>}
                                            </p>
                                        </div>

                                        <MobileRow label="Follow Up" value={user.followUp} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Pagination Controls */}
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => fetchUsers(page - 1, searchTerm, activeFilters)}
                            className="px-3 py-1 border rounded bg-white disabled:opacity-50 text-sm shadow-sm"
                        >
                            Prev
                        </button>
                        <button
                            disabled={page === totalPages}
                            onClick={() => fetchUsers(page + 1, searchTerm, activeFilters)}
                            className="px-3 py-1 border rounded bg-white disabled:opacity-50 text-sm shadow-sm"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Helper Components ---

const InspectButton = ({ userId, mobile }) => (
    <a
        href={`/admin/search?q=${userId}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center justify-center border border-gray-300 rounded hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors text-gray-500
            ${mobile ? "px-3 py-1 text-xs gap-1 bg-white shadow-sm" : "p-1 bg-gray-100"}`}
    >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        {mobile && <span>Inspect</span>}
    </a>
);

const MobileRow = ({ label, value }) => (
    <div className="flex justify-between items-start border-b border-gray-50 pb-1 last:border-0">
        <span className="text-xs font-bold text-gray-400 uppercase mt-0.5">{label}</span>
        <span className="text-gray-900 text-right max-w-[70%] break-words">
            {value || <span className="text-gray-300 italic font-normal">Empty</span>}
        </span>
    </div>
);

const Empty = () => <span className="text-gray-300 italic">Empty</span>;

const FilterButton = ({ label, isActive, onClick, color }) => {
    const baseClass = "px-3 py-1 rounded-full text-xs font-medium border transition-colors";
    const activeClass = `bg-${color}-100 text-${color}-800 border-${color}-200`;
    const inactiveClass = "bg-white text-gray-600 border-gray-300 hover:bg-gray-50";

    return (
        <button onClick={onClick} className={`${baseClass} ${isActive ? activeClass : inactiveClass}`}>
            {label} {isActive && "✓"}
        </button>
    );
};

export default UserInputsPage;