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

    // Initial Load
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
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">User Data Logs</h1>

            {/* --- CONTROLS SECTION --- */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 space-y-4">
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search by User ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded text-sm"
                    />
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium">
                        Search
                    </button>
                </form>

                {/* Filter Toggles */}
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-medium text-gray-500 mr-2">Filter by filled:</span>
                    <FilterButton label="School Name" isActive={activeFilters.school} onClick={() => toggleFilter('school')} color="blue" />
                    <FilterButton label="Birthday" isActive={activeFilters.birthday} onClick={() => toggleFilter('birthday')} color="purple" />
                    <FilterButton label="Explanation" isActive={activeFilters.explanation} onClick={() => toggleFilter('explanation')} color="emerald" />
                    <FilterButton label="Follow Up" isActive={activeFilters.followUp} onClick={() => toggleFilter('followUp')} color="orange" />
                </div>
            </div>

            {/* --- TABLE SECTION --- */}
            <div className="bg-white border border-gray-200 shadow rounded-lg overflow-hidden">
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
                        {loading ? (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-500">No users found matching filters.</td></tr>
                        ) : (
                            users.map(user => (
                                <tr key={user._id} className="hover:bg-gray-50 group">
                                    {/* --- MODIFIED USER COLUMN --- */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            {/* Admin Search Button */}
                                            <a
                                                href={`/admin/search?q=${user._id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="transition-opacity p-1 bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-600 rounded border border-gray-300"
                                                title="Inspect User"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" />
                                                </svg>
                                            </a>
                                            <span className="text-xs font-mono text-gray-500">
                                                {user._id.slice(-6)}...
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-sm text-gray-900">{user.schoolName || <Empty />}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{user.birthday ? new Date(user.birthday).toLocaleDateString() : <Empty />}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        <div className="max-w-xs truncate" title={user.explanation}>{user.explanation || <Empty />}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{user.followUp || <Empty />}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-end gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => fetchUsers(page - 1, searchTerm, activeFilters)}
                        className="px-3 py-1 border rounded bg-white disabled:opacity-50 text-sm"
                    >
                        Previous
                    </button>
                    <button
                        disabled={page === totalPages}
                        onClick={() => fetchUsers(page + 1, searchTerm, activeFilters)}
                        className="px-3 py-1 border rounded bg-white disabled:opacity-50 text-sm"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Helper Components ---

const Empty = () => <span className="text-gray-300 italic">Empty</span>;

const FilterButton = ({ label, isActive, onClick, color }) => {
    // Note: Ensure these classes are safelisted in Tailwind config if using JIT/Purge
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