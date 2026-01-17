import { useEffect, useState, useCallback, useMemo } from "react";
import dayjs from "dayjs";
import UserCell from "../../components/UserCell";

const PAGE_SIZE = 30;

const TotalUsers = () => {
    const [users, setUsers] = useState([]);
    const [totalCount, setTotalCount] = useState(0);

    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // Filters
    const [userType, setUserType] = useState(""); // "", "study", "homework", "half", "other"

    // Users must be at least N days old (createdAt <= now - N days)
    const [minAccountAgeDays, setMinAccountAgeDays] = useState("0");

    // Upload buckets
    const [uploadBucket, setUploadBucket] = useState("all");
    const [uploadsMin, setUploadsMin] = useState("");
    const [uploadsMax, setUploadsMax] = useState("");

    // Optional createdFrom
    const [createdFrom, setCreatedFrom] = useState("");

    // ✅ NEW: age filters
    const [ageMin, setAgeMin] = useState(""); // e.g. "13"
    const [ageMax, setAgeMax] = useState(""); // e.g. "18"

    const computedUploadRange = useMemo(() => {
        if (uploadBucket === "custom") {
            const min = uploadsMin === "" ? null : String(Math.max(0, parseInt(uploadsMin, 10)));
            const max = uploadsMax === "" ? null : String(Math.max(0, parseInt(uploadsMax, 10)));
            return { min, max };
        }

        if (uploadBucket === "all") return { min: null, max: null };
        if (uploadBucket === "0") return { min: "0", max: "0" };
        if (uploadBucket === "1") return { min: "1", max: "1" };
        if (uploadBucket === "2") return { min: "2", max: "2" };
        if (uploadBucket === "3plus") return { min: "3", max: null };

        return { min: null, max: null };
    }, [uploadBucket, uploadsMin, uploadsMax]);

    // createdTo = now - minAccountAgeDays
    const computedCreatedTo = useMemo(() => {
        const n = parseInt(minAccountAgeDays, 10);
        if (Number.isNaN(n) || n <= 0) return null;
        return dayjs().subtract(n, "day").toISOString();
    }, [minAccountAgeDays]);

    const fetchUsers = useCallback(
        async (pageToLoad, reset = false) => {
            try {
                if (pageToLoad !== 1) setLoadingMore(true);

                const params = new URLSearchParams({
                    page: String(pageToLoad),
                    limit: String(PAGE_SIZE),
                    sortBy: "createdAt",
                    order: "desc",
                });

                // userType
                if (userType && userType !== "all") params.set("userType", userType);

                // created range
                if (createdFrom) params.set("createdFrom", createdFrom);
                if (computedCreatedTo) params.set("createdTo", computedCreatedTo);

                // uploads
                if (computedUploadRange.min !== null) params.set("uploadsMin", computedUploadRange.min);
                if (computedUploadRange.max !== null) params.set("uploadsMax", computedUploadRange.max);

                // ✅ age range
                if (ageMin !== "" && !Number.isNaN(parseInt(ageMin, 10))) params.set("ageMin", String(parseInt(ageMin, 10)));
                if (ageMax !== "" && !Number.isNaN(parseInt(ageMax, 10))) params.set("ageMax", String(parseInt(ageMax, 10)));

                const res = await fetch(
                    `${process.env.REACT_APP_API_URL}/analytics/users?${params.toString()}`,
                    {
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                    }
                );

                const data = await res.json();

                if (data.success) {
                    setTotalCount(data.total);

                    if (reset || pageToLoad === 1) {
                        setUsers(data.users || []);
                    } else {
                        setUsers((prev) => [...prev, ...(data.users || [])]);
                    }

                    setHasMore((data.users || []).length === PAGE_SIZE);
                } else {
                    console.error("Failed to load users:", data.error);
                }
            } catch (err) {
                console.error("API error:", err);
            } finally {
                setLoadingMore(false);
            }
        },
        [userType, createdFrom, computedCreatedTo, computedUploadRange, ageMin, ageMax]
    );

    // Reload when filters change
    useEffect(() => {
        setPage(1);
        fetchUsers(1, true);
    }, [userType, minAccountAgeDays, createdFrom, uploadBucket, uploadsMin, uploadsMax, ageMin, ageMax, fetchUsers]);

    // Load more when page changes
    useEffect(() => {
        if (page === 1) return;
        fetchUsers(page);
    }, [page, fetchUsers]);

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

    const filterButtons = [
        { label: "ALL", value: "" },
        { label: "공부러", value: "study" },
        { label: "숙제러", value: "homework" },
        { label: "반반", value: "half" },
        { label: "미확인", value: "other" },
    ];

    const uploadButtons = [
        { label: "ALL", value: "all" },
        { label: "0", value: "0" },
        { label: "1", value: "1" },
        { label: "2", value: "2" },
        { label: "3+", value: "3plus" },
        { label: "CUSTOM", value: "custom" },
    ];

    const createdToLabel = useMemo(() => {
        if (!computedCreatedTo) return "No cutoff";
        return `${minAccountAgeDays}d+ (<= ${dayjs(computedCreatedTo).format("YYYY-MM-DD")})`;
    }, [computedCreatedTo, minAccountAgeDays]);

    return (
        <div className="font-sans bg-gray-200 flex flex-col items-center min-h-screen pb-28">
            {/* FILTERS TOP */}
            <div className="w-full max-w-4xl p-2 space-y-2">
                {/* userType */}
                <div className="flex flex-wrap gap-1">
                    {filterButtons.map((btn) => (
                        <button
                            key={btn.value}
                            onClick={() => {
                                setUserType(btn.value);
                                setPage(1);
                            }}
                            className={`px-2.5 h-9 flex items-center justify-center text-xs rounded-full shadow border
                ${userType === btn.value ? "bg-indigo-600 text-white" : "bg-white/80"}`}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>

                {/* Min account age cutoff */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-500">Min account age</span>

                    <input
                        type="number"
                        min="0"
                        value={minAccountAgeDays}
                        onChange={(e) => setMinAccountAgeDays(e.target.value)}
                        className="text-xs w-24 px-2 py-1 rounded border"
                        placeholder="days"
                    />
                    <span className="text-xs text-gray-500">days</span>

                    <span className="text-xs text-indigo-600 bg-white/70 px-2 py-1 rounded border">
                        {createdToLabel}
                    </span>

                    {/* Optional: createdFrom lower bound */}
                    <div className="flex items-center gap-2 ml-auto">
                        <span className="text-xs text-gray-500">Created from (optional)</span>
                        <input
                            type="date"
                            value={createdFrom ? dayjs(createdFrom).format("YYYY-MM-DD") : ""}
                            onChange={(e) => {
                                if (!e.target.value) return setCreatedFrom("");
                                setCreatedFrom(dayjs(e.target.value).startOf("day").toISOString());
                            }}
                            className="text-xs px-2 py-1 rounded border"
                        />
                        {createdFrom && (
                            <button
                                onClick={() => setCreatedFrom("")}
                                className="text-xs px-2 py-1 rounded border bg-white/80"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* ✅ Age filter */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-500">Age</span>

                    <input
                        type="number"
                        min="0"
                        placeholder="min"
                        value={ageMin}
                        onChange={(e) => setAgeMin(e.target.value)}
                        className="text-xs w-20 px-2 py-1 rounded border"
                    />
                    <span className="text-xs text-gray-500">to</span>
                    <input
                        type="number"
                        min="0"
                        placeholder="max"
                        value={ageMax}
                        onChange={(e) => setAgeMax(e.target.value)}
                        className="text-xs w-20 px-2 py-1 rounded border"
                    />

                    {(ageMin || ageMax) && (
                        <button
                            onClick={() => {
                                setAgeMin("");
                                setAgeMax("");
                            }}
                            className="text-xs px-2 py-1 rounded border bg-white/80"
                        >
                            Clear
                        </button>
                    )}

                    <span className="text-[11px] text-gray-500">
                        (Only users with birthday)
                    </span>
                </div>

                {/* Upload buckets */}
                <div className="flex flex-wrap gap-1 items-center">
                    <p className="text-xs text-gray-500 mr-1">Uploads</p>
                    {uploadButtons.map((btn) => (
                        <button
                            key={btn.value}
                            onClick={() => {
                                setUploadBucket(btn.value);
                                setPage(1);
                            }}
                            className={`px-2.5 h-9 flex items-center justify-center text-xs rounded-full shadow border
                ${uploadBucket === btn.value ? "bg-indigo-600 text-white" : "bg-white/80"}`}
                        >
                            {btn.label}
                        </button>
                    ))}

                    {uploadBucket === "custom" && (
                        <div className="flex items-center gap-2 ml-2">
                            <input
                                type="number"
                                min="0"
                                placeholder="min"
                                value={uploadsMin}
                                onChange={(e) => setUploadsMin(e.target.value)}
                                className="text-xs w-20 px-2 py-1 rounded border"
                            />
                            <input
                                type="number"
                                min="0"
                                placeholder="max"
                                value={uploadsMax}
                                onChange={(e) => setUploadsMax(e.target.value)}
                                className="text-xs w-20 px-2 py-1 rounded border"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* HEADER */}
            <div className="flex space-x-1 p-2 w-full font-semibold items-center max-w-4xl">
                <p className="font-semibold w-full text-gray-500">유저목록</p>
                <p className="text-xs text-indigo-600 flex-shrink-0">{totalCount.toLocaleString()}명</p>
            </div>

            {/* USER LIST */}
            <div className="bg-gray-800 divide-y divide-gray-500 max-w-4xl w-full">
                {users.map((user) => (
                    <UserCell key={user._id} user={user} />
                ))}
            </div>

            {/* LOADING STATES */}
            {loadingMore && (
                <div className="text-center py-4 font-semibold text-gray-600">Loading more users...</div>
            )}

            {!hasMore && !loadingMore && (
                <div className="text-center py-4 text-gray-500">No more users.</div>
            )}
        </div>
    );
};

export default TotalUsers;
