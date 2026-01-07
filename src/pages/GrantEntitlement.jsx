import React, { useState } from "react";

const GrantEntitlement = () => {
    const [userId, setUserId] = useState("");
    const [duration, setDuration] = useState("monthly");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const handleGrant = async (e) => {
        if (e) e.preventDefault();

        // Basic validation
        if (!userId.trim()) {
            setMessage({ type: "error", text: "Please enter a valid User ID" });
            return;
        }

        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/subscription/grant-web-access`,
                {
                    method: "POST",
                    // IMPORTANT: Include credentials to send session cookies
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        userId: userId.trim(),
                        duration
                    }),
                }
            );

            const data = await response.json();

            if (response.ok && data.success) {
                setMessage({
                    type: "success",
                    text: `Successfully granted ${duration} access to user!`
                });
                setUserId("");
            } else {
                // Handle 401 (Not Logged In) or 403 (Not Admin) specifically
                const errorMsg = response.status === 403
                    ? "Forbidden: You do not have Admin privileges."
                    : (data.error || "Failed to grant entitlement");

                setMessage({ type: "error", text: errorMsg });
            }
        } catch (err) {
            setMessage({ type: "error", text: "Network error. Is the backend running?" });
            console.error("Grant Error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans flex justify-center items-start">
            <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Grant Premium</h1>
                    <p className="text-sm text-gray-500">Admin Session-based Access Tool</p>
                </div>

                <form onSubmit={handleGrant} className="space-y-6">
                    {/* User ID Section */}
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

                    {/* Duration Selection */}
                    <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Entitlement Length
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

                    {/* Action Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-xl font-bold text-white transition-all transform active:scale-[0.98] ${loading
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-gray-900 hover:bg-black shadow-lg shadow-gray-200"
                            }`}
                    >
                        {loading ? "Confirming with RevenueCat..." : "Grant Access Now"}
                    </button>
                </form>

                {/* Feedback Message */}
                {message.text && (
                    <div className={`mt-6 p-4 rounded-xl text-sm leading-relaxed border ${message.type === "success"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-rose-50 text-rose-700 border-rose-100"
                        }`}>
                        <span className="font-bold">{message.type === "success" ? "✓" : "✕"}</span> {message.text}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GrantEntitlement;