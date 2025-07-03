import React, { useEffect, useState } from 'react';

const PAGE_SIZE = 20;

const Users = () => {
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchUsers = async (pageNum) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/users?page=${pageNum}&pageSize=${PAGE_SIZE}`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await res.json();
            if (data.success) {
                setUsers(data.users);
                setPage(data.page);
                setTotalPages(data.totalPages);
                setTotalCount(data.totalCount);
            } else {
                setError(data.error || 'Failed to load users');
            }
        } catch (err) {
            setError('Error fetching users');
        } finally {
            setLoading(false);
        }
    };

    function timeAgo(dateString) {
        const now = new Date();
        const past = new Date(dateString);
        const diffMs = now - past; // difference in milliseconds

        const seconds = Math.floor(diffMs / 1000);
        if (seconds < 60) return `${seconds}초 전`;

        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}분 전`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}시간 전`;

        const days = Math.floor(hours / 24);
        if (days < 30) return `${days}일 전`;

        const months = Math.floor(days / 30);
        if (months < 12) return `${months}개월 전`;

        const years = Math.floor(months / 12);
        return `${years}년 전`;
    }


    useEffect(() => {
        fetchUsers(page);
    }, [page]);

    if (!loading)
        return (
            <div className="max-w-4xl font-sans bg-gray-200">
                <div className="flex h-12 items-center w-full justify-between px-2">
                    <p className='font-medium text-sm text-indigo-500'>유저: {totalCount.toLocaleString()}</p>
                </div>
                {!loading && !error && (
                    <>
                        <ul className="divide-y divide-gray-300 bg-white px-4">
                            {users.map((user) => (
                                <li key={user._id} className="py-3 flex justify-between items-center">
                                    <div className='w-full'>
                                        <div className='flex items-center justify-between mb-1'>
                                            <p className="font-semibold">{user.name || 'Unnamed User'}</p>
                                            <p className='text-xs text-gray-500 space-x-1'>
                                                <span style={{ fontSize: 10 }}>({new Date(user.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
                                                <span>{timeAgo(user.createdAt)}</span>
                                            </p>
                                        </div>
                                        <p className="text-xs text-gray-600">{user.provider || 'Unknown'} ∙ {user.email || 'No email'}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className="flex justify-center gap-4 mt-6">
                            <button
                                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                disabled={page === 1}
                                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="self-center text-sm">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                                disabled={page === totalPages}
                                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}
            </div>
        );
};

export default Users;
