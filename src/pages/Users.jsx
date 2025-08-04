import { useEffect, useState, useCallback } from 'react';

const PAGE_SIZE = 20;

const subscriptionStatusColors = {
    active: 'text-green-600 bg-green-100',
    canceled: 'text-yellow-600 bg-yellow-100',
    expired: 'text-red-600 bg-red-100',
    none: 'text-gray-500 bg-gray-100',
};

const Users = () => {
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
        <div className="max-w-6xl font-sans bg-gray-200 rounded-md shadow p-4">
            <header className="flex items-center justify-between mb-4">
                <p className='font-medium text-sm text-indigo-500'>유저 총 {totalCount.toLocaleString()}명</p>
                <div className="text-sm text-gray-600">페이지 {page}</div>
            </header>

            <ul className="bg-white rounded-md shadow divide-y divide-gray-200">
                {users.map((user) => {
                    const createdAtDate = new Date(user.createdAt);
                    const subscriptionExpires = user.subscriptionExpiresAt
                        ? new Date(user.subscriptionExpiresAt).toLocaleDateString()
                        : '-';

                    return (
                        <li
                            key={user._id}
                            className="py-4 px-6 flex flex-col sm:flex-row sm:items-center sm:space-x-6"
                            title={`ID: ${user._id}`}
                        >
                            {/* Profile */}
                            <div className="flex-shrink-0 mb-3 sm:mb-0">
                                {user.profileImageUrl ? (
                                    <a
                                        href={user.profileImageUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block w-14 h-14 rounded-full overflow-hidden border border-gray-300 hover:ring-2 hover:ring-indigo-400 transition"
                                    >
                                        <img
                                            src={user.profileImageUrl}
                                            alt={`${user.name}'s profile`}
                                            className="object-cover w-full h-full"
                                            loading="lazy"
                                        />
                                    </a>
                                ) : (
                                    <div className="w-14 h-14 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold text-xl select-none">
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

                                    <span>∙</span>

                                    <span
                                        className="truncate font-mono text-indigo-700 cursor-pointer underline decoration-dotted"
                                        title="Click to copy referralId"
                                        onClick={() =>
                                            user.referralId && copyToClipboard(user.referralId)
                                        }
                                    >
                                        초대코드: {user.referralId}
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

                                <div className="mt-1 flex flex-wrap gap-2 items-center text-xs">
                                    <span
                                        className={`inline-block px-2 py-0.5 rounded-full font-mono ${subscriptionStatusColors[user.subscriptionStatus] ||
                                            subscriptionStatusColors.none
                                            }`}
                                        title="Subscription status"
                                    >
                                        구독: {user.subscriptionStatus || 'none'}
                                    </span>

                                    <span className="text-gray-600 font-mono">
                                        타입: {user.subscriptionType || '-'}
                                    </span>

                                    <span className="text-gray-600 font-mono">
                                        만료: {subscriptionExpires}
                                    </span>
                                </div>

                                {user.invitedByCode && (
                                    <div className="text-xs text-gray-600 font-mono truncate max-w-full mt-1">
                                        초대한 사람 코드: {user.invitedByCode}
                                    </div>
                                )}

                                <div className="text-xs text-gray-600 font-mono mt-1">
                                    초대한 사람 수: {user.invitees?.length || 0}명{' '}
                                    (사용 완료: {user.invitees?.filter((i) => i.redeemed).length || 0}명)
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
