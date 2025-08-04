import { useEffect, useState, useCallback } from 'react';
import UploadsCard from '../components/cards/UploadCard';

const PAGE_SIZE = 25;

const Uploads = () => {

    const [questions, setQuestions] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [totalQuestions, setTotalQuestions] = useState(true);

    const loadQuestions = useCallback(
        async (pageToLoad) => {
            try {
                if (!pageToLoad === 1) {
                    setLoadingMore(true);
                }

                const res = await fetch(
                    `${process.env.REACT_APP_API_URL}/solved-questions/admin-panel?page=${pageToLoad}&pageSize=${PAGE_SIZE}`,
                    { credentials: 'include' }
                );
                const data = await res.json();

                if (data.success) {
                    console.log(data);
                    setTotalCount(data.totalCount);
                    setTotalQuestions(data.totalQuestions);  // <-- Add this line

                    if (pageToLoad === 1) {
                        setQuestions(data.questions);
                    } else {
                        setQuestions((prev) => [...prev, ...data.questions]);
                    }

                    setHasMore(data.questions.length === PAGE_SIZE);
                } else {
                    console.error('Failed to load questions');
                }
            } catch (err) {
                console.error('❌ API error:', err);
            } finally {
                setLoadingMore(false);
            }
        },
        []
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

    return (
        <div className="w-full font-sans bg-gray-200 flex flex-col items-center">
            {/* View mode toggle buttons */}
            <div className="flex h-12 items-center w-full justify-between px-2">
                <p className='font-medium text-sm text-indigo-500'>총 업로드 수: {totalCount} / 문제 수: {totalQuestions}</p>
            </div>

            {/* Content */}
            <div className="w-full max-w-4xl flex flex-col items-center">
                <div className="space-y-8">
                    {questions.map((q, qIndex) => (
                        <UploadsCard key={q._id || qIndex} q={q} qIndex={qIndex} onDelete={handleDelete} />
                    ))}
                </div>
                {loadingMore && <p className="text-center py-4 text-gray-600">Loading more...</p>}
                {!hasMore && <p className="text-center py-4 text-gray-600">No more results.</p>}
            </div>
        </div>
    );
};

export default Uploads;
