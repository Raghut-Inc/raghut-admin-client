import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { BsDatabase } from "react-icons/bs";
import { FaListUl } from "react-icons/fa6";
import { AiOutlineReload } from "react-icons/ai";

export default function DBStats() {
    const location = useLocation();
    const navigate = useNavigate();

    const path = location.pathname.toLowerCase();
    let mode = "overview";
    if (path.includes("collections")) mode = "collections";

    const setMode = (m) => navigate(`/admin/db-stats/${m}`);

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState([]);
    const [dbName, setDbName] = useState("");
    const [error, setError] = useState("");

    async function fetchStats() {
        try {
            setLoading(true);
            setError("");
            const res = await fetch(`${process.env.REACT_APP_API_URL}/db-stats`);
            const data = await res.json();
            if (!data.success) throw new Error(data.error || "Failed to fetch");
            setStats(data.results || []);
            setDbName(data.dbName || "");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <div className="w-full font-sans bg-gray-100 flex flex-col items-center min-h-screen pb-20">
            <div className="w-full max-w-4xl mt-10 px-4">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <BsDatabase className="w-6 h-6 text-indigo-600" />
                    Database Stats
                </h1>
                {dbName && (
                    <p className="text-sm text-gray-500 mt-1">
                        Connected to: <span className="font-mono">{dbName}</span>
                    </p>
                )}

                <div className="mt-4 flex items-center gap-3">
                    <button
                        onClick={fetchStats}
                        disabled={loading}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-indigo-700 disabled:opacity-60"
                    >
                        <AiOutlineReload className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                    {loading && <span className="text-gray-500 text-sm">Loading stats...</span>}
                    {error && <span className="text-red-600 text-sm">{error}</span>}
                </div>

                {!loading && !error && (
                    <div className="mt-6 overflow-x-auto">
                        <table className="min-w-full bg-white shadow rounded-lg overflow-hidden">
                            <thead className="bg-gray-200 text-gray-700 text-sm font-semibold">
                                <tr>
                                    <th className="py-2 px-3 text-left">Collection</th>
                                    <th className="py-2 px-3 text-right">Documents</th>
                                    <th className="py-2 px-3 text-right">Storage (MB)</th>
                                    <th className="py-2 px-3 text-right">Avg Obj (B)</th>
                                    <th className="py-2 px-3 text-right">Index (MB)</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {stats.map((c) => (
                                    <tr key={c.collection} className="border-t hover:bg-gray-50">
                                        <td className="py-2 px-3 font-mono">{c.collection}</td>
                                        <td className="py-2 px-3 text-right">{c.count.toLocaleString()}</td>
                                        <td className="py-2 px-3 text-right">{c.storageMB}</td>
                                        <td className="py-2 px-3 text-right">{c.avgObjSize?.toLocaleString() || "-"}</td>
                                        <td className="py-2 px-3 text-right">{c.totalIndexSizeMB}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* --- Bottom Floating Toggle --- */}
            <div className="flex-shrink-0 flex justify-center z-30 h-12 items-center overflow-hidden fixed bottom-2 shadow-xl border-t rounded-full bg-white/60 backdrop-blur-xl">
                <button
                    onClick={() => setMode("overview")}
                    className={`px-3 h-full w-16 flex items-center justify-center text-xs font-semibold transition-all
            ${mode === "overview" ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-200"}`}
                >
                    <BsDatabase className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setMode("collections")}
                    className={`px-3 h-full w-16 flex items-center justify-center text-xs font-semibold transition-all
            ${mode === "collections" ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-200"}`}
                >
                    <FaListUl className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
