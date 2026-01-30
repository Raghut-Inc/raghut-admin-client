import React, { useState } from "react";

const GrantEntitlement = () => {
    const [userId, setUserId] = useState("");
    const [duration, setDuration] = useState("monthly");
    const [loading, setLoading] = useState(false);
    const [billingLoading, setBillingLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    // State to hold the last billing result stats specifically
    const [lastStats, setLastStats] = useState(null);

    const handleGrant = async (e) => {
        if (e) e.preventDefault();
        if (!userId.trim()) {
            setMessage({ type: "error", text: "Please enter a valid User ID" });
            return;
        }

        setLoading(true);
        setMessage({ type: "", text: "" });
        setLastStats(null);

        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/subscription/grant-web-access`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: userId.trim(), duration }),
                }
            );

            const data = await response.json();
            if (response.ok && data.success) {
                setMessage({ type: "success", text: `Successfully granted ${duration} access!` });
                setUserId("");
            } else {
                setMessage({ type: "error", text: data.error || "Failed to grant entitlement" });
            }
        } catch (err) {
            setMessage({ type: "error", text: "Network error. Is the backend running?" });
        } finally {
            setLoading(false);
        }
    };

    const handleManualBilling = async () => {
        const confirmRun = window.confirm("Trigger global Kakao Pay recurring billing loop?");
        if (!confirmRun) return;

        setBillingLoading(true);
        setMessage({ type: "", text: "" });
        setLastStats(null);

        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/payment/admin/test-billing`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                }
            );

            const data = await response.json();

            if (response.ok && data.results) {
                setLastStats(data.results);
                setMessage({
                    type: "success",
                    text: "Billing cycle completed successfully."
                });
            } else {
                setMessage({ type: "error", text: data.error || "Billing trigger failed" });
            }
        } catch (err) {
            setMessage({ type: "error", text: "Network error. Check CORS or Server logs." });
        } finally {
            setBillingLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans flex flex-col items-center">
            <div className="w-full max-w-md space-y-6">

                {/* 1. Grant Access Card */}
                <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">Chalcack Admin</h1>
                        <p className="text-sm text-gray-500">Manual Entitlement Tool</p>
                    </div>

                    <form onSubmit={handleGrant} className="space-y-6">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Target User ID (MongoDB)
                            </label>
                            <input
                                type="text"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                placeholder="Paste user._id here"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Duration
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {["monthly", "yearly", "lifetime"].map((d) => (
                                    <button
                                        key={d}
                                        type="button"
                                        onClick={() => setDuration(d)}
                                        className={`py-2 text-xs font-semibold rounded-lg border transition-all ${duration === d
                                            ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200"
                                            : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                                            }`}
                                    >
                                        {d.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || billingLoading}
                            className={`w-full py-4 rounded-xl font-bold text-white transition-all transform active:scale-[0.98] ${(loading || billingLoading)
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-gray-900 hover:bg-black shadow-lg shadow-gray-200"
                                }`}
                        >
                            {loading ? "Granting..." : "Grant Web Access"}
                        </button>
                    </form>
                </div>

                {/* 2. Billing Maintenance Card */}
                <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-gray-900">Billing Tasks</h2>
                        <span className="px-2 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold rounded uppercase tracking-tighter">
                            Web Only
                        </span>
                    </div>

                    <button
                        onClick={handleManualBilling}
                        disabled={loading || billingLoading}
                        className={`w-full py-3 rounded-lg text-xs font-bold border transition-all ${billingLoading
                            ? "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed"
                            : "bg-white text-rose-600 border-rose-100 hover:bg-rose-50 hover:border-rose-200"
                            }`}
                    >
                        {billingLoading ? "Processing Loop..." : "🚀 Trigger Recurring Billing"}
                    </button>

                    {/* Stats Display area */}
                    {lastStats && (
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                                <div className="text-[10px] text-emerald-600 font-bold uppercase">Success</div>
                                <div className="text-lg font-black text-emerald-700">{lastStats.success}</div>
                            </div>
                            <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-center">
                                <div className="text-[10px] text-rose-600 font-bold uppercase">Failed</div>
                                <div className="text-lg font-black text-rose-700">{lastStats.failed}</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. Feedback Alert */}
                {message.text && (
                    <div className={`p-4 rounded-xl text-sm leading-relaxed border ${message.type === "success"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : "bg-rose-50 text-rose-700 border-rose-100"
                        }`}>
                        <span className="font-bold mr-2">{message.type === "success" ? "✓" : "✕"}</span>
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GrantEntitlement;