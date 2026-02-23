import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router";
import UserCell from "../components/UserCell";
import UploadCard from "../components/cards/UploadCard";

const PAGE_SIZE = 25;

export default function SearchResult() {
    const [searchParams] = useSearchParams();
    // Still using the same query param, but we’ll interpret it
    const rawQuery = searchParams.get("q") || "";

    const [user, setUser] = useState(null);
    const [uploads, setUploads] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // ✅ Core fetch (same structure as before, but chooses endpoint)
    const fetchUploads = useCallback(
        async (pageToLoad, reset = false) => {
            if (!rawQuery) return;

            try {
                if (pageToLoad === 1) setLoading(true);
                else setLoadingMore(true);

                const params = new URLSearchParams({
                    q: rawQuery,
                    page: pageToLoad.toString(),
                    pageSize: PAGE_SIZE.toString(),
                });

                const endpoint = `${process.env.REACT_APP_API_URL}/analytics/search-user?${params.toString()}`;

                const res = await fetch(endpoint, { credentials: "include" });
                const data = await res.json();

                if (data.success) {
                    setUser(data.user);
                    setTotalCount(data.totalCount || 0);

                    if (reset || pageToLoad === 1) setUploads(data.uploads || []);
                    else setUploads((prev) => [...prev, ...(data.uploads || [])]);

                    setHasMore((data.uploads?.length || 0) === PAGE_SIZE);
                } else {
                    alert(data.error || "User not found");
                    setUser(null);
                    setUploads([]);
                    setHasMore(false);
                }
            } catch (err) {
                console.error("❌ Error fetching uploads:", err);
                setHasMore(false);
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [rawQuery]
    );

    const handleDelete = async (id) => {
        if (!window.confirm("정말 이 문제를 삭제하시겠습니까?")) return;
        try {
            const res = await fetch(
                `${process.env.REACT_APP_API_URL}/solved-questions/${id}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );
            const data = await res.json();
            if (data.success) {
                setUploads((prev) => prev.filter((q) => q._id !== id));
            } else {
                alert("삭제에 실패했습니다.");
                console.error("Delete failed:", data.error);
            }
        } catch (err) {
            alert("삭제 중 오류가 발생했습니다.");
            console.error("Delete error:", err);
        }
    };

    // ✅ Initial load when query changes
    useEffect(() => {
        setPage(1);
        setHasMore(true);
        setUser(null);
        setUploads([]);
        if (rawQuery) {
            fetchUploads(1, true);
        }
    }, [rawQuery, fetchUploads]);

    // ✅ Load more when `page` changes
    useEffect(() => {
        if (page === 1) return;
        fetchUploads(page);
    }, [page, fetchUploads]);

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

        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, [hasMore, loadingMore]);

    // ✅ Render states
    if (!rawQuery) {
        return (
            <div className="text-center mt-20 text-gray-500">
                검색할 ID 또는 username을 입력해주세요.
            </div>
        );
    }

    if (loading && page === 1) {
        return (
            <div className="text-center mt-20 text-gray-500">
                Loading...
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center mt-20 text-gray-500">
                No user found for: {rawQuery}
            </div>
        );
    }

    return (
        <div className="font-sans bg-gray-200 flex flex-col items-center min-h-screen">
            {/* --- USER INFO --- */}
            <div className="w-full max-w-xl mt-2">
                <h2 className="font-semibold text-gray-500 p-2">유저정보</h2>
                <div className="bg-gray-800">
                    <UserCell user={user} />
                </div>
            </div>

            {/* --- UPLOADS --- */}
            <div className="w-full max-w-xl mt-4">
                <h2 className="font-semibold text-gray-500 p-2">
                    업로드 ({totalCount.toLocaleString()}개)
                </h2>
                <div className="divide-y divide-gray-300 bg-white w-full">
                    {uploads.map((q) => (
                        <UploadCard key={q._id} q={q} onDelete={handleDelete} />
                    ))}
                </div>

                {uploads.length === 0 && (
                    <div className="text-gray-500 text-center py-6">
                        No uploads found.
                    </div>
                )}

                {loadingMore && (
                    <div className="text-center py-4 text-gray-600 font-semibold">
                        Loading more...
                    </div>
                )}

                {!hasMore && !loadingMore && uploads.length > 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                        🔚 No more uploads 🔚
                    </div>
                )}
            </div>
        </div>
    );
}
