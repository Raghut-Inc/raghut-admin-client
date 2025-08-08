import { useEffect, useState, useCallback } from 'react';
import UploadsCard from '../components/cards/UploadCard';
import { useSearchParams } from 'react-router';
import NavBar from '../components/NavBar';

const PAGE_SIZE = 25;

const Uploads = ({ user, setUser }) => {

    const [questions, setQuestions] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [loading, setLoading] = useState(false);

    // Search params for filter
    const [searchParams, setSearchParams] = useSearchParams();

    // Extract filter params from URL
    const userIdFilter = searchParams.get('userId') || '';
    const guestUUIDFilter = searchParams.get('guestUUID') || '';

    const loadQuestions = useCallback(
        async (pageToLoad) => {
            try {
                if (pageToLoad === 1) {
                    setLoading(true);
                } else {
                    setLoadingMore(true);
                }

                const buildQueryString = (pageToLoad) => {
                    const params = new URLSearchParams();
                    params.set('page', pageToLoad);
                    params.set('pageSize', PAGE_SIZE);
                    if (userIdFilter) params.set('userId', userIdFilter);
                    if (guestUUIDFilter) params.set('guestUUID', guestUUIDFilter);
                    return params.toString();
                };

                const queryString = buildQueryString(pageToLoad);

                const res = await fetch(
                    `${process.env.REACT_APP_API_URL}/solved-questions/admin-panel?${queryString}`,
                    { credentials: 'include' }
                );
                const data = await res.json();

                if (data.success) {
                    setTotalCount(data.totalCount);
                    setTotalQuestions(data.totalQuestions);

                    if (pageToLoad === 1) {
                        setQuestions(data.questions);
                    } else {
                        setQuestions((prev) => [...prev, ...data.questions]);
                    }
                    console.log(data.questions)
                    setHasMore(data.questions.length === PAGE_SIZE);
                } else {
                    console.error('Failed to load questions');
                }
            } catch (err) {
                console.error('❌ API error:', err);
            } finally {
                if (pageToLoad === 1) {
                    setLoading(false);
                } else {
                    setLoadingMore(false);
                }
            }
        },
        [userIdFilter, guestUUIDFilter]
    );

    // Delete handler
    const handleDelete = async (id) => {
        if (!window.confirm('정말 이 문제를 삭제하시겠습니까?')) return;

        try {
            const res = await fetch(
                `${process.env.REACT_APP_API_URL}/solved-questions/${id}`,
                {
                    method: 'DELETE',
                }
            );
            const data = await res.json();
            if (data.success) {
                setQuestions(prev => prev.filter(q => q._id !== id));
                setTotalCount((count) => count - 1);
            } else {
                alert('삭제에 실패했습니다.');
                console.error('Delete failed:', data.error);
            }
        } catch (err) {
            alert('삭제 중 오류가 발생했습니다.');
            console.error('Delete error:', err);
        }
    };

    // Load first page on mount
    useEffect(() => {
        loadQuestions(1);
        setPage(1);
    }, [loadQuestions]);

    // Scroll event handler for infinite scroll
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

    // Load more when page increments
    useEffect(() => {
        if (page === 1) return; // already loaded on mount
        loadQuestions(page);
    }, [page, loadQuestions]);


    const setFilter = (filter) => {
        // filter is an object like { userId: "abc" } or { guestUUID: "xyz" }
        const newParams = new URLSearchParams();

        // Clear page to 1 on filter change
        newParams.set('page', 1);
        newParams.set('pageSize', PAGE_SIZE);

        if (filter.userId) {
            newParams.set('userId', filter.userId);
        }
        if (filter.guestUUID) {
            newParams.set('guestUUID', filter.guestUUID);
        }
        setSearchParams(newParams);
        setPage(1);
    };


    // Clear filter handlers
    const clearUserIdFilter = () => {
        searchParams.delete('userId');
        setSearchParams(searchParams);
    };
    const clearGuestUUIDFilter = () => {
        searchParams.delete('guestUUID');
        setSearchParams(searchParams);
    };

    return (
        <div className="w-full font-sans bg-gray-200 flex flex-col h-full items-center">
            <NavBar user={user} setUser={setUser} animate={true} title={"업로드"} value1={`업로드 ${totalCount}`} value2={`문제 ${totalQuestions}`} />

            {/* View mode toggle buttons */}
            {(userIdFilter || guestUUIDFilter) && (
                <div className="flex h-12 items-center w-full justify-end px-2 sticky top-14 bg-white z-20">
                    <div className='max-w-64'>
                        {userIdFilter && (
                            <button onClick={clearUserIdFilter} className="text-white bg-indigo-400 border px-3 py-1 rounded-full flex items-center text-xs space-x-2">
                                <span className='line-clamp-1'>{userIdFilter}</span>
                                <div className="font-bold text-indigo-800">×</div>
                            </button>
                        )}
                        {guestUUIDFilter && (
                            <button onClick={clearGuestUUIDFilter} className="text-white bg-indigo-400 border px-3 py-1 rounded-full flex items-center text-xs space-x-2">
                                <span className='line-clamp-1'>{guestUUIDFilter}</span>
                                <div className="font-bold text-indigo-800">×</div>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center h-48 w-full bg-white rounded-lg shadow-inner">
                    <span className="animate-spin rounded-full h-12 w-12 border-b-4 border-r-4 border-indigo-500"></span>
                </div>
            ) : (
                <div className="w-full max-w-4xl flex flex-col items-center">
                    <div className="space-y-8">
                        {questions.map((q, qIndex) => (
                            <UploadsCard
                                key={q._id || qIndex}
                                q={q}
                                qIndex={qIndex}
                                onDelete={handleDelete}
                                setFilter={setFilter}
                            />
                        ))}
                    </div>
                    {loadingMore && (
                        <p className="text-center py-4 text-gray-600">Loading more...</p>
                    )}
                    {!hasMore && (
                        <p className="text-center text-sm py-4 text-gray-600">
                            🔚🔚🔚 No more results 🔚🔚🔚
                        </p>
                    )}
                </div>
            )}

        </div >
    );
};

export default Uploads;
