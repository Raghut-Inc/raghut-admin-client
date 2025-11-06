import { useEffect, useState, useCallback, useMemo } from "react";
import UploadCard from "../components/cards/UploadCard";
import { useSearchParams } from "react-router"; // keep your existing import
import UserCell from "../components/UserCell";
import { PiCardsThree } from "react-icons/pi";
import { LiaIdCardSolid } from "react-icons/lia";
import { BsThreeDots } from "react-icons/bs";
import { FaCheck } from "react-icons/fa6";

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

  const [searchParams, setSearchParams] = useSearchParams();

  const userIdFilter = searchParams.get("userId") || "";
  const guestUUIDFilter = searchParams.get("guestUUID") || "";
  const mode = (searchParams.get("mode") || "cards").toLowerCase(); // 'cards' | 'summary'
  const status = (searchParams.get("status") || "").toLowerCase(); // 'cards' | 'summary'

  // New filters
  const statusFilterRaw = searchParams.get("status") || "";
  const subjectFilterRaw = searchParams.get("subject") || "";

  // Validate enums (ignore unknowns)
  const statusFilter = useMemo(() => {
    const allowed = new Set(STATUS_OPTIONS.map(o => o.value));
    return allowed.has(statusFilterRaw) ? statusFilterRaw : "";
  }, [statusFilterRaw]);

  const subjectFilter = useMemo(() => {
    const allowed = new Set(SUBJECT_OPTIONS.map(o => o.value));
    return allowed.has(subjectFilterRaw) ? subjectFilterRaw : "";
  }, [subjectFilterRaw]);

  // ---------------- CARDS (existing + filters) ----------------
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
        if (statusFilter) params.set("status", statusFilter);
        if (subjectFilter) params.set("subject", subjectFilter);

        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/solved-questions/admin-panel?${params.toString()}&includeUserStats=true`,
          { credentials: "include" }
        );
        const data = await res.json();

        if (data.success) {
          setTotalCount(data.totalCount);
          setTotalQuestions(data.totalQuestions);
          console.log("✅ Questions:", data.questions);
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
    [userIdFilter, guestUUIDFilter, statusFilter, subjectFilter, mode]
  );

  // ---------------- SUMMARY (updated) ----------------
  const loadSummary = useCallback(
    async (pageToLoad) => {
      if (mode !== "summary") return; // guard
      try {
        if (pageToLoad === 1) setLoading(true);
        else setLoadingMore(true);

        const params = new URLSearchParams();
        params.set("page", pageToLoad);
        params.set("pageSize", PAGE_SIZE);

        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/solved-questions/admin-panel/summary?${params.toString()}`,
          { credentials: "include" }
        );
        const data = await res.json();

        if (!data.success) {
          console.error("⚠️ Failed to load summary:", data.error);
          return;
        }

        console.log("✅ Summary users:", data.users);

        // 🔹 Update list of users
        const newUsers = data.users || [];

        if (pageToLoad === 1) {
          setSummaryRows(newUsers);
        } else {
          setSummaryRows((prev) => [...prev, ...newUsers]);
        }

        // 🔹 Update pagination flags
        setHasMore(newUsers.length === PAGE_SIZE);
      } catch (err) {
        console.error("❌ Summary API error:", err);
      } finally {
        if (pageToLoad === 1) setLoading(false);
        else setLoadingMore(false);
      }
    },
    [mode]
  );

  const updateParams = useCallback((mutate) => {
    setSearchParams((prev) => {
      const np = new URLSearchParams(prev);
      mutate(np);
      return np;
    });
  }, [setSearchParams]);

  // Delete handler (cards)
  const handleDelete = async (id) => {
    if (!window.confirm("정말 이 문제를 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/solved-questions/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setQuestions((prev) => prev.filter((q) => q._id !== id));
        setTotalCount((count) => Math.max(0, count - 1));
      } else {
        alert("삭제에 실패했습니다.");
        console.error("Delete failed:", data.error);
      }
    } catch (err) {
      alert("삭제 중 오류가 발생했습니다.");
      console.error("Delete error:", err);
    }
  };

  // Apply status/subject changes
  const applyStatus = useCallback(
    (v) => {
      updateParams((np) => {
        if (v) np.set("status", v);
        else np.delete("status");
        np.set("page", "1");
        np.set("pageSize", String(PAGE_SIZE));
        if (mode !== "cards") np.set("mode", mode);
      });
      setPage(1);
    },
    [updateParams, mode, setPage] // ✅ add stable dependencies
  );

  // Initial load & when mode changes
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    if (mode === "cards") {
      loadQuestions(1);
    } else {
      loadSummary(1);
    }
  }, [mode, loadQuestions, loadSummary, applyStatus]);

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

  const setFilter = (filter) => {
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("pageSize", String(PAGE_SIZE));

    if (filter.userId) {
      params.set("userId", filter.userId);
    } else if (filter.guestUUID) {
      params.set("guestUUID", filter.guestUUID);
    }

    const url = `/admin/uploads?${params.toString()}`;
    window.open(`${window.location.origin}${url}`, "_blank", "noopener,noreferrer");
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
      <div className="flex space-x-1 p-2 w-full font-semibold items-center">
        <p className="font-semibold w-full text-gray-500">{mode === "cards" ? "최근 문제" : "최근 유저"}</p>
        <p className="text-xs text-gray-500 flex-shrink-0">업로드 / 문제수 : </p>
        <p className="text-xs text-indigo-600 flex-shrink-0">{totalCount} / {totalQuestions}</p>
      </div>
      {/* Mode toggle */}
      <div className="flex-shrink-0 flex justify-center z-30 h-12 items-center overflow-hidden fixed bottom-2 shadow-xl border-t rounded-full bg-white/60 backdrop-blur-xl">
        <button
          onClick={() => setMode("cards")}
          className={`px-3 h-full w-16 flex items-center justify-center text-xs ${mode === "cards" ? "bg-indigo-600 text-white" : "text-gray-700"
            }`}
        >
          <PiCardsThree className="w-6 h-6" />
        </button>
        <button
          onClick={() => setMode("summary")}
          className={`px-3 h-full w-16 flex items-center justify-center text-xs ${mode === "summary" ? "bg-indigo-600 text-white" : "text-gray-700"
            }`}
        >
          <LiaIdCardSolid className="w-6 h-6" />
        </button>
      </div>

      {/* Status toggle */}
      {mode === "cards" && (
        <div className="flex-shrink-0 flex justify-center z-30 items-center overflow-hidden fixed bottom-12 space-x-1 p-4">
          <button
            onClick={() => applyStatus("")}
            className={`px-3 h-10 w-10 flex items-center justify-center text-xs rounded-full shadow-xl border-t ${status === "" ? "bg-indigo-600 text-white" : " bg-white/60 backdrop-blur-xl"
              }`}
          >
            ALL
          </button>
          <button
            onClick={() => applyStatus("done")}
            className={`px-3 h-10 w-10 flex items-center justify-center text-xs rounded-full shadow-xl border-t ${status === "done" ? "bg-indigo-600 text-white" : " bg-white/60 backdrop-blur-xl"
              }`}
          >
            <FaCheck />
          </button>
          <button
            onClick={() => applyStatus("processing")}
            className={`px-3 h-10 w-10 flex items-center justify-center text-xs rounded-full shadow-xl border-t ${status === "processing" ? "bg-indigo-600 text-white" : "bg-white/60 backdrop-blur-xl"
              }`}
          >
            <BsThreeDots />
          </button>
        </div>
      )}

      {/* Controls row */}
      {(userIdFilter || guestUUIDFilter) && (
        <div className="flex h-12 items-center justify-center px-2 fixed top-0 z-30">
          {userIdFilter && (
            <button
              onClick={clearUserIdFilter}
              className="text-white bg-indigo-500 px-3 py-1 rounded-full flex items-center text-xs space-x-2 shadow-xl border-t w-40"
            >
              <span className="truncate">{userIdFilter}</span>
              <div className="font-bold text-indigo-800">×</div>
            </button>
          )}
          {guestUUIDFilter && (
            <button
              onClick={clearGuestUUIDFilter}
              className="text-white bg-indigo-400 border px-3 py-1 rounded-full flex items-center text-xs space-x-2 w-40"
            >
              <span className="line-clamp-1">{guestUUIDFilter.slice(0, 6)}...</span>
              <div className="font-bold text-indigo-800">×</div>
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48 w-full bg-white">
          <svg aria-hidden="true" className="w-5 h-5 text-gray-500 animate-spin dark:text-gray-600 fill-white" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
          </svg>
        </div>
      ) : (
        <div className="w-full max-w-4xl flex flex-col items-center">
          {mode === "summary" ? (
            <>
              {summaryRows.map((row) => (
                <div key={row.user._id} className="bg-gray-800 w-full mb-px">
                  <UserCell
                    user={row.user}
                    compact={true}
                    stats={{
                      totalUploads: row.uploads,
                      totalQuestions: row.totalQuestions,
                      todayUploads: row.todayUploads,
                      todayQuestions: row.todayQuestions,
                      activeDays: row.activeDays,
                      firstAt: row.firstAt,
                      lastAt: row.lastAt,
                      avgProcessingTimeMs: row.avgProcessingTimeMs,
                    }}
                    onFilter={setFilter}
                  />
                </div>
              ))}
              {loadingMore && <p className="text-center py-4 text-gray-600">Loading more...</p>}
              {!hasMore && <p className="text-center text-sm py-4 text-gray-600">🔚🔚🔚 No more results 🔚🔚🔚</p>}
            </>
          ) : (
            <div className="w-full flex flex-col items-center">
              <div className="divide-y w-full flex flex-col items-center">
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
