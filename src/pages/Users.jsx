import { useEffect, useState, useCallback } from 'react';

import { useNavigate } from 'react-router';
import UserCell from '../components/UserCell';

const PAGE_SIZE = 20;

const Users = ({ user, setUser }) => {
    const navigate = useNavigate(); // ⬅️ add this

    const [users, setUsers] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const fetchUsers = useCallback(
        async (pageToLoad) => {
            try {
                if (pageToLoad !== 1) {
                    setLoadingMore(true);
                }

                const res = await fetch(
                    `${process.env.REACT_APP_API_URL}/users?page=${pageToLoad}&pageSize=${PAGE_SIZE}&includeUserStats=true`,
                    {
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                    }
                );
                const data = await res.json();

                if (data.success) {
                    setTotalCount(data.totalCount);
                    console.log(data.users)

                    if (pageToLoad === 1) {
                        setUsers(data.users);
                    } else {
                        setUsers((prev) => [...prev, ...data.users]);
                    }

                    // If fewer than PAGE_SIZE results, no more pages
                    setHasMore(data.users.length === PAGE_SIZE);
                } else {
                    console.error('Failed to load users:', data.error);
                }
            } catch (err) {
                console.error('API error:', err);
            } finally {
                setLoadingMore(false);
            }
        },
        []
    );

    const goToUploads = ({ userId, guestUUID } = {}) => {
        const params = new URLSearchParams();
        params.set('page', '1');
        params.set('pageSize', '25');        // match Uploads PAGE_SIZE
        if (userId) params.set('userId', userId);
        if (guestUUID) params.set('guestUUID', guestUUID);
        // force Cards view (Uploads defaults to cards when 'mode' is absent)
        navigate({ pathname: '/admin/uploads', search: `?${params.toString()}` });
    };
    // Load first page on mount
    useEffect(() => {
        fetchUsers(1);
    }, [fetchUsers]);

    // Load more users when page increments (except page 1)
    useEffect(() => {
        if (page === 1) return; // already loaded on mount
        fetchUsers(page);
    }, [page, fetchUsers]);

    // Scroll handler for infinite scroll
    useEffect(() => {
        if (!hasMore || loadingMore) return;

        const onScroll = () => {
            if (
                window.innerHeight + window.scrollY >=
                document.documentElement.scrollHeight - 300
            ) {
                setPage((prev) => prev + 1);
            }
        };

        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, [hasMore, loadingMore]);

    return (
        <div className="font-sans bg-gray-200 flex flex-col items-center">
            <div className="flex space-x-1 p-2 w-full font-semibold items-center">
                <p className="font-semibold w-full text-gray-500">유저목록</p>
                <p className="text-xs text-indigo-600 flex-shrink-0">{totalCount.toLocaleString()}명</p>
            </div>
            <div className="bg-gray-800 divide-y divide-gray-200 max-w-4xl w-full">
                {users.map((user) => {
                    return (
                        <UserCell
                            key={user._id}
                            user={user}
                            stats={user.uploadStats}
                            onFilter={goToUploads}
                        />
                    );
                })}
            </div>

            {loadingMore && (
                <div className="text-center py-4 font-semibold text-gray-600">
                    Loading more users...
                </div>
            )}

            {!hasMore && (
                <div className="text-center py-4 text-gray-500">No more users.</div>
            )}
        </div>
    );
};

export default Users;
