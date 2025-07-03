import { useEffect, useState, useCallback } from 'react';
import { Grid, List } from 'lucide-react';
import UploadsCard from '../components/UploadsCard';
import UploadsListItem from '../components/UploadsListItem';

const PAGE_SIZE = 25;

const Uploads = () => {
    const getInitialView = () => {
        if (typeof window === 'undefined') return 'card';
        const params = new URLSearchParams(window.location.search);
        const view = params.get('view');
        return view === 'list' ? 'list' : 'card';
    };

    const [viewMode, setViewMode] = useState(getInitialView);
    const [questions, setQuestions] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // Update URL param on viewMode change (same as before)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        params.set('view', viewMode);
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState(null, '', newUrl);
    }, [viewMode]);

    const loadQuestions = useCallback(
        async (pageToLoad) => {
            try {
                if (pageToLoad === 1) {
                    setLoading(true);
                } else {
                    setLoadingMore(true);
                }

                const res = await fetch(
                    `${process.env.REACT_APP_API_URL}/solved-questions?page=${pageToLoad}&pageSize=${PAGE_SIZE}`
                );
                const data = await res.json();
                if (data.success) {
                    setTotalCount(data.totalCount)
                    if (pageToLoad === 1) {
                        setQuestions(data.questions);
                    } else {
                        setQuestions((prev) => [...prev, ...data.questions]);
                    }

                    // If fewer than PAGE_SIZE results returned, no more pages
                    setHasMore(data.questions.length === PAGE_SIZE);
                } else {
                    console.error('Failed to load questions');
                }
            } catch (err) {
                console.error('❌ API error:', err);
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        []
    );

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

    if (loading && page === 1) {
        return <div className='w-full h-screen flex items-center justify-center bg-gray-200 text-sm text-gray-500'>Loading...</div>;
    }

    return (
        <div className="w-full font-sans bg-gray-200 flex flex-col items-center">
            {/* View mode toggle buttons */}
            <div className="flex h-12 items-center w-full justify-between px-2">
                <p className='font-medium text-sm text-indigo-500'>총 업로드 수: {totalCount}</p>
                <div className='flex'>
                    <button
                        onClick={() => setViewMode('card')}
                        className={`flex items-center justify-center w-16 h-8 rounded-l-full ${viewMode === 'card' ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-700'
                            }`}
                        aria-label="카드 뷰"
                        title="카드 뷰"
                    >
                        <Grid size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex items-center justify-center w-16 h-8 rounded-r-full ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-700'
                            }`}
                        aria-label="리스트 뷰"
                        title="리스트 뷰"
                    >
                        <List size={20} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="w-full max-w-4xl">
                {viewMode === 'card' ? (
                    <div className="space-y-8">
                        {questions.map((q, qIndex) => (
                            <UploadsCard key={q._id || qIndex} q={q} qIndex={qIndex} />
                        ))}
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-300">
                        {questions.map((q, qIndex) => (
                            <UploadsListItem key={q._id || qIndex} q={q} qIndex={qIndex} />
                        ))}
                    </ul>
                )}

                {loadingMore && <p className="text-center py-4 text-gray-600">Loading more...</p>}
                {!hasMore && <p className="text-center py-4 text-gray-600">No more results.</p>}
            </div>
        </div>
    );
};

export default Uploads;
