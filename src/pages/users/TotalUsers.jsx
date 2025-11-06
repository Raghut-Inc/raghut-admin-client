import { useEffect, useState, useCallback } from 'react';
import UserCell from '../../components/UserCell';

const PAGE_SIZE = 30;

const TotalUsers = () => {

    const [users, setUsers] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [userType, setUserType] = useState(''); // "", "study", "homework", "half", "other"

    // ✅ Core fetch function (with filter)
    const fetchUsers = useCallback(
        async (pageToLoad, reset = false) => {
            try {
                if (pageToLoad !== 1) setLoadingMore(true);

                const params = new URLSearchParams({
                    page: pageToLoad,
                    pageSize: PAGE_SIZE,
                    includeUserStats: 'true',
                });

                if (userType && userType !== 'all') params.set('userType', userType);

                const res = await fetch(
                    `${process.env.REACT_APP_API_URL}/users?${params.toString()}`,
                    {
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                    }
                );

                const data = await res.json();

                if (data.success) {
                    setTotalCount(data.totalCount);

                    if (reset || pageToLoad === 1) {
                        setUsers(data.users);
                    } else {
                        setUsers((prev) => [...prev, ...data.users]);
                    }

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
        [userType]
    );

    // ✅ Open uploads view in new tab
    const goToUploads = ({ userId, guestUUID } = {}) => {
        const params = new URLSearchParams();
        params.set("page", "1");
        params.set("pageSize", "25");
        if (userId) params.set("userId", userId);
        if (guestUUID) params.set("guestUUID", guestUUID);

        const url = `/admin/uploads?${params.toString()}`;
        window.open(url, "_blank", "noopener,noreferrer");
    };

    // ✅ Reload when filter changes
    useEffect(() => {
        setPage(1);
        fetchUsers(1, true);
    }, [userType, fetchUsers]);

    // ✅ Load more when scrolling
    useEffect(() => {
        if (page === 1) return;
        fetchUsers(page);
    }, [page, fetchUsers]);

    // ✅ Infinite scroll
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

    // ✅ Filter buttons
    const filterButtons = [
        { label: 'ALL', value: '' },
        { label: '공부러', value: 'study' },
        { label: '숙제러', value: 'homework' },
        { label: '반반', value: 'half' },
        { label: '미확인', value: 'other' },
    ];

    return (
        <div className="font-sans bg-gray-200 flex flex-col items-center min-h-screen">
            {/* --- FILTER BAR --- */}
            <div className="flex justify-center fixed bottom-4 z-30 space-x-1 shadow-sm">
                {filterButtons.map((btn) => (
                    <button
                        key={btn.value}
                        onClick={() => {
                            setUserType(btn.value);
                            setPage(1);
                        }}
                        className={`px-2.5 h-10 flex items-center justify-center text-xs rounded-full shadow-xl border-t 
                            ${userType === btn.value
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white/60 backdrop-blur-xl'
                            }`}
                    >
                        {btn.label}
                    </button>
                ))}
            </div>

            {/* --- HEADER --- */}
            <div className="flex space-x-1 p-2 w-full font-semibold items-center max-w-4xl">
                <p className="font-semibold w-full text-gray-500">유저목록</p>
                <p className="text-xs text-indigo-600 flex-shrink-0">
                    {totalCount.toLocaleString()}명
                </p>
            </div>

            {/* --- USER LIST --- */}
            <div className="bg-gray-800 divide-y divide-gray-500 max-w-4xl w-full">
                {users.map((user) => (
                    <UserCell
                        key={user._id}
                        user={user}
                        stats={user.uploadStats}
                        onFilter={goToUploads}
                        compact={true}
                    />
                ))}
            </div>

            {/* --- LOADING STATES --- */}
            {loadingMore && (
                <div className="text-center py-4 font-semibold text-gray-600">
                    Loading more users...
                </div>
            )}

            {!hasMore && !loadingMore && (
                <div className="text-center py-4 text-gray-500">No more users.</div>
            )}
        </div>
    );
};

export default TotalUsers;
