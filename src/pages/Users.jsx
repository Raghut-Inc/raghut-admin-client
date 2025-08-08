import { useEffect, useState, useCallback } from 'react';
import NavBar from '../components/NavBar';

const PAGE_SIZE = 20;

const Users = ({ user, setUser }) => {
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
                    `${process.env.REACT_APP_API_URL}/users?page=${pageToLoad}&pageSize=${PAGE_SIZE}`,
                    {
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                    }
                );
                const data = await res.json();

                if (data.success) {
                    setTotalCount(data.totalCount);

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

    function timeAgo(dateString) {
        const now = new Date();
        const past = new Date(dateString);
        const diffMs = now - past;

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

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).catch(() => {
            alert('복사에 실패했습니다. 직접 복사해 주세요.');
        });
    };

    return (
        <div className="font-sans bg-gray-200 flex flex-col items-center">
            <NavBar user={user} setUser={setUser} animate={true} title={"유저"} value1={`유저수 ${totalCount.toLocaleString()}`} value2={`페이지 ${page}`} />

            <ul className="bg-white rounded-md divide-y divide-gray-200 max-w-4xl w-full">
                {users.map((user) => {
                    const createdAtDate = new Date(user.createdAt);
                    return (
                        <li
                            key={user._id}
                            className="p-4 flex space-x-4"
                            title={`ID: ${user._id}`}
                        >
                            {/* Profile */}
                            <div className="flex-shrink-0 mb-3 sm:mb-0">
                                {user.profileImageUrl ? (
                                    <a
                                        href={user.profileImageUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block w-12 h-12 rounded-full overflow-hidden border border-gray-300 hover:ring-2 hover:ring-indigo-400 transition"
                                    >
                                        <img
                                            src={user.profileImageUrl}
                                            alt={`${user.name}'s profile`}
                                            className="object-cover w-full h-full"
                                            loading="lazy"
                                        />
                                    </a>
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold text-xl select-none">
                                        {user.name?.[0]?.toUpperCase() || '?'}
                                    </div>
                                )}
                            </div>

                            {/* User Info */}
                            <div className="flex-grow min-w-0 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-semibold text-sm truncate max-w-xs">
                                        {user.name || 'Unnamed User'}
                                    </p>

                                    <span
                                        className={`px-2 py-0.5 text-xs rounded-full font-mono ${user.role === 'admin'
                                            ? 'bg-indigo-100 text-indigo-800'
                                            : 'bg-gray-100 text-gray-600'
                                            }`}
                                        title="User Role"
                                    >
                                        {user.role.toUpperCase()}
                                    </span>

                                    <span
                                        className="text-xs text-gray-500 uppercase font-mono"
                                        title="Login Provider"
                                    >
                                        {user.provider || 'UNKNOWN'}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 max-w-full">
                                    <span
                                        className="truncate cursor-pointer underline decoration-dotted"
                                        title="Click to copy email"
                                        onClick={() => user.email && copyToClipboard(user.email)}
                                    >
                                        {user.email || 'No email'}
                                    </span>
                                </div>

                                <div className="text-xs text-gray-400 font-mono truncate max-w-full">
                                    ID: {user._id}
                                </div>

                                <div className="text-xs text-gray-500 flex gap-2 items-center">
                                    <time
                                        dateTime={user.createdAt}
                                        title={createdAtDate.toLocaleString()}
                                        className="whitespace-nowrap"
                                    >
                                        가입: {createdAtDate.toLocaleDateString()} (
                                        {timeAgo(user.createdAt)})
                                    </time>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>

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
