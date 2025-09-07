import { useEffect, useState, useCallback } from "react";
import UploadCard from "../components/cards/UploadCard";
import UploaderSummaryTable from "../components/cards/UploaderSummaryTable";
import { useSearchParams } from "react-router"; // keep your existing import
import NavBar from "../components/NavBar";

const PAGE_SIZE = 25;

const Uploads = ({ user, setUser }) => {
  const [questions, setQuestions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(false);

  // SUMMARY STATE
  const [summaryRows, setSummaryRows] = useState([]);
  const [summaryTotal, setSummaryTotal] = useState(0);

  const [searchParams, setSearchParams] = useSearchParams();

  const userIdFilter = searchParams.get("userId") || "";
  const guestUUIDFilter = searchParams.get("guestUUID") || "";
  const mode = (searchParams.get("mode") || "cards").toLowerCase(); // 'cards' | 'summary'

  // ---------------- CARDS (existing) ----------------
  const loadQuestions = useCallback(
    async (pageToLoad) => {
      if (mode !== "cards") return; // guard
      try {
        if (pageToLoad === 1) setLoading(true);
        else setLoadingMore(true);

        const params = new URLSearchParams();
        params.set("page", pageToLoad);
        params.set("pageSize", PAGE_SIZE);
        if (userIdFilter) params.set("userId", userIdFilter);
        if (guestUUIDFilter) params.set("guestUUID", guestUUIDFilter);

        const res = await fetch(`${process.env.REACT_APP_API_URL}/solved-questions/admin-panel?${params.toString()}`, {
          credentials: "include",
        });
        const data = await res.json();

        console.log(data)
        if (data.success) {
          setTotalCount(data.totalCount);
          setTotalQuestions(data.totalQuestions);
          if (pageToLoad === 1) setQuestions(data.questions);
          else setQuestions((prev) => [...prev, ...data.questions]);
          setHasMore(data.questions.length === PAGE_SIZE);
        } else {
          console.error("Failed to load questions");
        }
      } catch (err) {
        console.error("❌ API error:", err);
      } finally {
        if (pageToLoad === 1) setLoading(false);
        else setLoadingMore(false);
      }
    },
    [userIdFilter, guestUUIDFilter, mode]
  );

  // ---------------- SUMMARY (new) ----------------
  const loadSummary = useCallback(
    async (pageToLoad) => {
      if (mode !== "summary") return; // guard
      try {
        if (pageToLoad === 1) setLoading(true);
        else setLoadingMore(true);

        const params = new URLSearchParams();
        params.set("page", pageToLoad);
        params.set("pageSize", PAGE_SIZE);
        // Optional: allow subject/since/until/includeGuests via URL if you want later
        // (we’ll keep userId/guestUUID OUT here; summary is "who uploaded how many")

        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/solved-questions/admin-panel/summary?${params.toString()}`,
          { credentials: "include" }
        );
        const data = await res.json();

        if (data.success) {
          setSummaryTotal(data.total);
          if (pageToLoad === 1) setSummaryRows(data.rows);
          else setSummaryRows((prev) => [...prev, ...data.rows]);
          setHasMore(data.rows.length === PAGE_SIZE);
        } else {
          console.error("Failed to load summary");
        }
      } catch (err) {
        console.error("❌ Summary API error:", err);
      } finally {
        if (pageToLoad === 1) setLoading(false);
        else setLoadingMore(false);
      }
    },
    [mode]
  );

  const updateParams = (mutate) => {
    setSearchParams((prev) => {
      const np = new URLSearchParams(prev);
      mutate(np);
      return np;
    });
  };

  // Delete handler (cards)
  const handleDelete = async (id) => {
    if (!window.confirm("정말 이 문제를 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/solved-questions/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setQuestions((prev) => prev.filter((q) => q._id !== id));
        setTotalCount((count) => count - 1);
      } else {
        alert("삭제에 실패했습니다.");
        console.error("Delete failed:", data.error);
      }
    } catch (err) {
      alert("삭제 중 오류가 발생했습니다.");
      console.error("Delete error:", err);
    }
  };

  // Initial load & when mode changes
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    if (mode === "cards") {
      loadQuestions(1);
    } else {
      loadSummary(1);
    }
  }, [mode, loadQuestions, loadSummary]);

  // Infinite scroll
  useEffect(() => {
    if (!hasMore || loadingMore) return;
    const onScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 300) {
        setPage((prev) => prev + 1);
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [hasMore, loadingMore]);

  // Load more when page increments
  useEffect(() => {
    if (page === 1) return;
    if (mode === "cards") loadQuestions(page);
    else loadSummary(page);
  }, [page, mode, loadQuestions, loadSummary]);

  // Filters (for cards view)
  const setFilter = (filter) => {
    console.log(filter);
    updateParams((np) => {
      np.set("page", "1");
      np.set("pageSize", String(PAGE_SIZE));
      if (filter.userId) {
        np.set("userId", filter.userId);
        np.delete("guestUUID");
      } else if (filter.guestUUID) {
        np.set("guestUUID", filter.guestUUID);
        np.delete("userId");
      }
      // preserve current mode
      if (mode !== "cards") np.set("mode", mode);
    });
    setPage(1);
  };

  // Switch mode without losing existing params
  const setMode = (next) => {
    updateParams((np) => {
      if (next === "cards") np.delete("mode");
      else np.set("mode", "summary");
      np.set("page", "1");
      np.set("pageSize", String(PAGE_SIZE));
    });
    setPage(1);
  };

  const clearUserIdFilter = () => {
    const np = new URLSearchParams(searchParams.toString());
    np.delete("userId");
    setSearchParams(np);
  };
  const clearGuestUUIDFilter = () => {
    const np = new URLSearchParams(searchParams.toString());
    np.delete("guestUUID");
    setSearchParams(np);
  };

  return (
    <div className="w-full font-sans bg-gray-200 flex flex-col h-full items-center">
      <NavBar
        user={user}
        setUser={setUser}
        animate={true}
        title={"업로드"}
        value1={`업로드 ${totalCount}`}
        value2={`문제 ${totalQuestions}`}
      />

      <div className="flex justify-between h-10 items-center w-full px-2 sticky top-14 z-20">
        <div className="flex rounded-md overflow-hidden gap-1">
          <button
            onClick={() => setMode("cards")}
            className={`px-3 py-1 text-xs rounded-lg border ${mode === "cards" ? "bg-indigo-600 text-white" : "bg-white text-gray-700"
              }`}
          >
            Cards
          </button>
          <button
            onClick={() => setMode("summary")}
            className={`px-3 py-1 text-xs rounded-lg border ${mode === "summary" ? "bg-indigo-600 text-white" : "bg-white text-gray-700"
              }`}
          >
            Recent
          </button>
        </div>

        {(userIdFilter || guestUUIDFilter) && (
          <div className="max-w-48">
            {userIdFilter && (
              <button
                onClick={clearUserIdFilter}
                className="text-white bg-indigo-400 border px-3 py-1 rounded-full flex items-center text-xs space-x-2"
              >
                <span className="line-clamp-1">{userIdFilter.slice(0, 6)}...</span>
                <div className="font-bold text-indigo-800">×</div>
              </button>
            )}
            {guestUUIDFilter && (
              <button
                onClick={clearGuestUUIDFilter}
                className="text-white bg-indigo-400 border px-3 py-1 rounded-full flex items-center text-xs space-x-2"
              >
                <span className="line-clamp-1">{guestUUIDFilter.slice(0, 6)}...</span>
                <div className="font-bold text-indigo-800">×</div>
              </button>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 w-full bg-white rounded-lg shadow-inner">
          <span className="animate-spin rounded-full h-12 w-12 border-b-4 border-r-4 border-indigo-500"></span>
        </div>
      ) : (
        <div className="w-full max-w-4xl flex flex-col items-center">
          {mode === "summary" ? (
            <>
              <UploaderSummaryTable
                rows={summaryRows}
                total={summaryTotal}
                onFilter={(row) => {
                  updateParams((np) => {
                    np.set("page", "1");
                    np.set("pageSize", String(PAGE_SIZE));
                    if (row.kind === "user" && row.userId) {
                      np.set("userId", row.userId);
                      np.delete("guestUUID");
                    } else if (row.kind === "guest" && row.guestUUID) {
                      np.set("guestUUID", row.guestUUID);
                      np.delete("userId");
                    }
                    // force cards view
                    np.delete("mode"); // cards is default
                  });
                  setPage(1);
                }}
              />
              {loadingMore && <p className="text-center py-4 text-gray-600">Loading more...</p>}
              {!hasMore && <p className="text-center text-sm py-4 text-gray-600">🔚🔚🔚 No more results 🔚🔚🔚</p>}
            </>
          ) : (
            <div className="w-full flex flex-col items-center">
              <div className="space-y-8 w-full flex flex-col items-center">
                {questions.map((q, qIndex) => (
                  <UploadCard
                    key={q._id || qIndex}
                    q={q}
                    qIndex={qIndex}
                    onDelete={handleDelete}
                    setFilter={setFilter}
                  />
                ))}
              </div>
              {loadingMore && <p className="text-center py-4 text-gray-600">Loading more...</p>}
              {!hasMore && <p className="text-center text-sm py-4 text-gray-600">🔚🔚🔚 No more results 🔚🔚🔚</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Uploads;
