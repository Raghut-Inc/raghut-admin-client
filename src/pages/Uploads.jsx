import { useEffect, useState, useCallback, useMemo } from "react";
import UploadCard from "../components/cards/UploadCard";
import { useSearchParams } from "react-router";
import { FaCheck, FaLock, FaX } from "react-icons/fa6";
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
  const errorCodeFilter = searchParams.get("errorCodeFilter") || ""; // "" | "daily_limit"

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
        console.log(data.questions);
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
    [userIdFilter, statusFilter, subjectFilter, onlyWithErrorCode, errorCodeFilter]
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

  // Delete handler
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
        setQuestions((prev) => prev.filter((q) => q._id !== id));
      } else {
        alert("삭제에 실패했습니다.");
        console.error("Delete failed:", data.error);
      }
    } catch (err) {
      alert("삭제 중 오류가 발생했습니다.");
      console.error("Delete error:", err);
    }
  };

  // Apply status filter (also handles errorCode modes)
  const applyStatus = useCallback(
    (v) => {
      updateParams((np) => {
        if (v === "__errorCode") {
          // any errorCode != null / ""
          np.set("onlyWithErrorCode", "true");
          np.set("errorCodeFilter", "OTHER");      // ✅ matches backend
          np.delete("status");
        } else if (v === "__dailyLimit") {
          // ONLY DAILY_LIMIT_EXCEEDED
          np.set("onlyWithErrorCode", "true");
          np.set("errorCodeFilter", "DAILY_LIMIT_EXCEEDED");  // ✅ exact match
          np.delete("status");
        } else {
          // normal status logic
          if (v) np.set("status", v);
          else np.delete("status");
          // turning off error filters when going back to normal status
          np.delete("onlyWithErrorCode");
          np.delete("errorCodeFilter");
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
  }, [loadQuestions, applyStatus]);

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

  const isAllActive = statusFilter === "" && !onlyWithErrorCode;
  const isErrorAnyActive = onlyWithErrorCode && errorCodeFilter === "OTHER";
  const isDailyLimitActive = onlyWithErrorCode && errorCodeFilter === "DAILY_LIMIT_EXCEEDED";

  // ---------------- RENDER ----------------
  return (
    <div className="w-full font-sans bg-gray-200 flex flex-col h-full items-center min-h-screen">
      <div className="flex space-x-1 p-2 w-full font-semibold items-center">
        <p className="font-semibold w-full text-gray-500">최근 업로드 {totalCount}</p>
      </div>

      {/* Status + errorCode toggles */}
      <div className="flex-shrink-0 flex justify-center z-30 items-center overflow-hidden fixed bottom-0 space-x-1 p-4">
        <button
          onClick={() => applyStatus("")}
          className={`px-3 h-10 w-10 flex items-center justify-center text-xs rounded-full shadow-xl border-t ${isAllActive
            ? "bg-indigo-600 text-white"
            : " bg-white/60 backdrop-blur-xl"
            }`}
        >
          ALL
        </button>
        <button
          onClick={() => applyStatus("done")}
          className={`px-3 h-10 w-10 flex items-center justify-center text-xs rounded-full shadow-xl border-t ${statusFilter === "done"
            ? "bg-indigo-600 text-white"
            : " bg-white/60 backdrop-blur-xl"
            }`}
        >
          <FaCheck />
        </button>
        <button
          onClick={() => applyStatus("processing")}
          className={`px-3 h-10 w-10 flex items-center justify-center rounded-full shadow-xl border-t ${statusFilter === "processing"
            ? "bg-indigo-600 text-white"
            : "bg-white/60 backdrop-blur-xl"
            }`}
        >
          <BiLoader className="w-10 h-10" />
        </button>

        {/* ❌ any errorCode */}
        <button
          onClick={() => applyStatus("__errorCode")}
          className={`px-3 h-10 w-10 flex items-center justify-center text-xs rounded-full shadow-xl border-t ${isErrorAnyActive
            ? "bg-indigo-600 text-white"
            : "bg-white/60 backdrop-blur-xl"
            }`}
        >
          <FaX />
        </button>

        {/* DL = DAILY_LIMIT_EXCEEDED */}
        <button
          onClick={() => applyStatus("__dailyLimit")}
          className={`px-3 h-10 w-10 flex items-center justify-center text-xs rounded-full shadow-xl border-t ${isDailyLimitActive
            ? "bg-indigo-600 text-white"
            : "bg-white/60 backdrop-blur-xl"
            }`}
        >
          <FaLock />
        </button>
      </div>

      {/* Filters */}
      {userIdFilter && (
        <div className="flex h-12 items-center justifycenter px-2 fixed top-0 z-30">
          <button
            onClick={clearUserIdFilter}
            className="text-white bg-indigo-500 px-3 py-1 rounded-full flex items-center text-xs space-x-2 shadow-xl border-t w-40"
          >
            <span className="truncate">{userIdFilter}</span>
            <div className="font-bold text-indigo-800">×</div>
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48 w-full bg-white">
          <svg
            aria-hidden="true"
            className="w-5 h-5 text-gray-500 animate-spin dark:text-gray-600 fill-white"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
        </div>
      ) : (
        <div className="w-full max-w-4xl flex flex-col items-center">
          <div className="divide-y w-full flex flex-col items-center">
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
            <p className="text-center py-4 text-gray-600">Loading more...</p>
          )}
          {!hasMore && (
            <p className="text-center text-sm py-4 text-gray-600">
              🔚🔚🔚 No more results 🔚🔚🔚
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Uploads;
