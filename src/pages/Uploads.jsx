import { useEffect, useState, useCallback, useMemo } from "react";
import UploadCard from "../components/cards/UploadCard";
import { useSearchParams } from "react-router";
import { FaCheck, FaLock, FaX, FaTrashCan } from "react-icons/fa6"; // Added FaTrashCan
import { BiLoader } from "react-icons/bi";

const PAGE_SIZE = 25;

const STATUS_OPTIONS = [
  { label: "Status", value: "" },
  { label: "Processing", value: "processing" },
  { label: "Done", value: "done" },
  { label: "Failed", value: "failed" },
];

const SUBJECT_OPTIONS = [
  { label: "Subject", value: "" },
  { label: "English", value: "english" },
  { label: "Korean", value: "korean" },
  { label: "Math", value: "math" },
  { label: "Physics", value: "physics" },
  { label: "Chemistry", value: "chemistry" },
  { label: "Biology", value: "biology" },
  { label: "Earth Science", value: "earth_science" },
  { label: "Korean History", value: "korean_history" },
  { label: "World History", value: "world_history" },
  { label: "Philosophy", value: "philosophy" },
  { label: "Other", value: "other" },
];

const Uploads = () => {
  const [questions, setQuestions] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState();

  const [searchParams, setSearchParams] = useSearchParams();
  const userIdFilter = searchParams.get("userId") || "";
  const statusFilterRaw = searchParams.get("status") || "";
  const subjectFilterRaw = searchParams.get("subject") || "";
  const onlyWithErrorCode = searchParams.get("onlyWithErrorCode") === "true";
  const errorCodeFilter = searchParams.get("errorCodeFilter") || "";
  const onlyDeletedFilter = searchParams.get("onlyDeleted") === "true"; // ✅ Added filter

  const statusFilter = useMemo(() => {
    const allowed = new Set(STATUS_OPTIONS.map((o) => o.value));
    return allowed.has(statusFilterRaw) ? statusFilterRaw : "";
  }, [statusFilterRaw]);

  const subjectFilter = useMemo(() => {
    const allowed = new Set(SUBJECT_OPTIONS.map((o) => o.value));
    return allowed.has(subjectFilterRaw) ? subjectFilterRaw : "";
  }, [subjectFilterRaw]);

  // ---------------- LOAD QUESTIONS ----------------
  const loadQuestions = useCallback(
    async (pageToLoad) => {
      try {
        if (pageToLoad === 1) setLoading(true);
        else setLoadingMore(true);

        const params = new URLSearchParams();
        params.set("page", pageToLoad);
        params.set("pageSize", PAGE_SIZE);
        params.set("source", "app")

        // --- ✅ NEW: Handle Soft Delete Logic ---
        if (onlyDeletedFilter) {
          params.set("onlyDeleted", "true");
          params.set("includeCount", "false");
        } else {
          // If we aren't looking at "Trash", we usually want to see active only
          // OR you can set includeDeleted=true if you want a mixed view.
          params.set("includeDeleted", "true");
        }

        if (userIdFilter) params.set("userId", userIdFilter);
        if (statusFilter) params.set("status", statusFilter);
        if (subjectFilter) params.set("subject", subjectFilter);
        if (onlyWithErrorCode) params.set("onlyWithErrorCode", "true");
        if (errorCodeFilter) params.set("errorCodeFilter", errorCodeFilter);

        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/analytics/total-solved-questions?${params.toString()}&includeUserStats=true`,
          { credentials: "include" }
        );
        const data = await res.json();

        if (data.success) {
          if (pageToLoad === 1) setQuestions(data.questions);
          else setQuestions((prev) => [...prev, ...data.questions]);
          setHasMore(data.questions.length === PAGE_SIZE);
          setTotalCount(data.totalCount)
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
    [userIdFilter, statusFilter, subjectFilter, onlyWithErrorCode, errorCodeFilter, onlyDeletedFilter]
  );

  const updateParams = useCallback(
    (mutate) => {
      setSearchParams((prev) => {
        const np = new URLSearchParams(prev);
        mutate(np);
        return np;
      });
    },
    [setSearchParams]
  );

  // Delete handler (Hard Delete)
  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ 경고: 이 문제는 영구 삭제됩니다. S3 이미지가 삭제되며 복구가 불가능합니다. 계속하시겠습니까?")) return;

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/solved-questions/${id}/hard-delete`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (data.success) {
        setQuestions((prev) => prev.filter((q) => q._id !== id));
      } else {
        alert(`삭제에 실패했습니다: ${data.error || "알 수 없는 오류"}`);
      }
    } catch (err) {
      alert("서버 통신 중 오류가 발생했습니다.");
    }
  };

  const applyStatus = useCallback(
    (v) => {
      updateParams((np) => {
        // Reset special filters first
        np.delete("onlyDeleted");
        np.delete("onlyWithErrorCode");
        np.delete("errorCodeFilter");
        np.delete("status");

        if (v === "__errorCode") {
          np.set("onlyWithErrorCode", "true");
          np.set("errorCodeFilter", "OTHER");
        } else if (v === "__dailyLimit") {
          np.set("onlyWithErrorCode", "true");
          np.set("errorCodeFilter", "DAILY_LIMIT_EXCEEDED");
        } else if (v === "__deleted") {
          // ✅ New Deleted Filter Case
          np.set("onlyDeleted", "true");
          np.set("includeCount", "false"); // <-- Bypasses the slow counting!
        } else if (v) {
          np.set("status", v);
        }

        np.set("page", "1");
        np.set("pageSize", String(PAGE_SIZE));
      });
      setPage(1);
    },
    [updateParams]
  );

  // Initial load
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    loadQuestions(1);
  }, [loadQuestions]);

  // Infinite scroll
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

  // Load more
  useEffect(() => {
    if (page === 1) return;
    loadQuestions(page);
  }, [page, loadQuestions]);

  const clearUserIdFilter = () => {
    const np = new URLSearchParams(searchParams.toString());
    np.delete("userId");
    setSearchParams(np);
  };

  const isAllActive = statusFilter === "" && !onlyWithErrorCode && !onlyDeletedFilter;
  const isErrorAnyActive = onlyWithErrorCode && errorCodeFilter === "OTHER";
  const isDailyLimitActive = onlyWithErrorCode && errorCodeFilter === "DAILY_LIMIT_EXCEEDED";

  // ---------------- RENDER ----------------
  return (
    <div className="w-full font-sans bg-gray-200 flex flex-col h-full items-center min-h-screen">
      <div className="flex space-x-1 p-2 w-full font-semibold items-center">
        <p className="font-semibold w-full text-gray-500">최근 업로드 {totalCount}</p>
      </div>

      {/* Status + errorCode + deleted toggles */}
      <div className="flex-shrink-0 flex justify-center z-40 items-center overflow-hidden fixed bottom-6 space-x-1 p-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 shadow-2xl">
        <button
          onClick={() => applyStatus("")}
          className={`px-3 h-10 w-10 flex items-center justify-center text-xs rounded-full shadow-lg ${isAllActive
            ? "bg-indigo-600 text-white"
            : "bg-white/80 text-gray-700 hover:bg-white"
            }`}
        >
          ALL
        </button>
        <button
          onClick={() => applyStatus("done")}
          className={`px-3 h-10 w-10 flex items-center justify-center text-xs rounded-full shadow-lg ${statusFilter === "done"
            ? "bg-indigo-600 text-white"
            : "bg-white/80 text-gray-700 hover:bg-white"
            }`}
        >
          <FaCheck />
        </button>
        <button
          onClick={() => applyStatus("processing")}
          className={`px-3 h-10 w-10 flex items-center justify-center rounded-full shadow-lg ${statusFilter === "processing"
            ? "bg-indigo-600 text-white"
            : "bg-white/80 text-gray-700 hover:bg-white"
            }`}
        >
          <BiLoader className="w-5 h-5" />
        </button>

        <button
          onClick={() => applyStatus("__errorCode")}
          className={`px-3 h-10 w-10 flex items-center justify-center text-xs rounded-full shadow-lg ${isErrorAnyActive
            ? "bg-indigo-600 text-white"
            : "bg-white/80 text-gray-700 hover:bg-white"
            }`}
        >
          <FaX />
        </button>

        <button
          onClick={() => applyStatus("__dailyLimit")}
          className={`px-3 h-10 w-10 flex items-center justify-center text-xs rounded-full shadow-lg ${isDailyLimitActive
            ? "bg-indigo-600 text-white"
            : "bg-white/80 text-gray-700 hover:bg-white"
            }`}
        >
          <FaLock />
        </button>

        {/* ✅ NEW: Trash Filter Button */}
        <button
          onClick={() => applyStatus("__deleted")}
          className={`px-3 h-10 w-10 flex items-center justify-center text-xs rounded-full shadow-lg ${onlyDeletedFilter
            ? "bg-red-600 text-white"
            : "bg-white/80 text-red-500 hover:bg-white"
            }`}
          title="Show Deleted Only"
        >
          <FaTrashCan />
        </button>
      </div>

      {/* Filters */}
      {userIdFilter && (
        <div className="flex h-12 items-center justify-center px-2 fixed top-4 z-30">
          <button
            onClick={clearUserIdFilter}
            className="text-white bg-indigo-500 px-4 py-1.5 rounded-full flex items-center text-xs space-x-2 shadow-xl border-t border-indigo-400"
          >
            <span className="truncate max-w-[120px]">{userIdFilter}</span>
            <div className="font-bold">×</div>
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64 w-full">
          <BiLoader className="w-10 h-10 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <div className="w-full max-w-4xl flex flex-col items-center pt-2 pb-24">
          <div className="divide-y w-full flex flex-col items-center gap-4">
            {questions.map((q, qIndex) => (
              <UploadCard
                key={q._id || qIndex}
                q={q}
                qIndex={qIndex}
                onDelete={handleDelete}
              />
            ))}
          </div>
          {loadingMore && (
            <div className="py-8">
              <BiLoader className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          )}
          {!hasMore && questions.length > 0 && (
            <p className="text-center text-sm py-8 text-gray-400 font-medium">
              🔚 No more results
            </p>
          )}
          {questions.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <p className="text-lg">검색 결과가 없습니다.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Uploads;