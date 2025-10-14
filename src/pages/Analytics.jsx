import { useLocation, useNavigate } from "react-router";
import AnalyticsSummary from "../components/analytics/AnalyticsSummary";
import AnalyticsChart from "../components/analytics/AnalyticsChart";
import AnalyticsUsers from "../components/analytics/AnalyticsUsers";
import { BsGraphUp } from "react-icons/bs";
import { TbCircleNumber0 } from "react-icons/tb";
import { FaUsers } from "react-icons/fa6";

export default function Analytics({ user, setUser }) {
    const location = useLocation();
    const navigate = useNavigate();

    // derive current mode from pathname
    const path = location.pathname.toLowerCase();
    let mode = "summary";
    if (path.includes("chart")) mode = "chart";
    else if (path.includes("users")) mode = "users";

    const setMode = (m) => navigate(`/admin/analytics/${m}`);

    return (
        <div className="w-full font-sans bg-gray-100 flex flex-col items-center min-h-screen">

            {/* --- Bottom Floating Toggle --- */}
            <div className="flex-shrink-0 flex justify-center z-30 h-12 items-center overflow-hidden fixed bottom-2 shadow-xl border-t rounded-full bg-white/60 backdrop-blur-xl">
                <button
                    onClick={() => setMode("summary")}
                    className={`px-3 h-full w-16 flex items-center justify-center text-xs font-semibold transition-all
            ${mode === "summary" ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-200"}`}
                >
                    <TbCircleNumber0 className="w-6 h-6" />
                </button>
                <button
                    onClick={() => setMode("chart")}
                    className={`px-3 h-full w-16 flex items-center justify-center text-xs font-semibold transition-all
            ${mode === "chart" ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-200"}`}
                >
                    <BsGraphUp className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setMode("users")}
                    className={`px-3 h-full w-16 flex items-center justify-center text-xs font-semibold transition-all
            ${mode === "users" ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-200"}`}
                >
                    <FaUsers className="w-5 h-5" />
                </button>
            </div>

            {/* --- Conditional Rendering --- */}
            {mode === "summary" && <AnalyticsSummary user={user} setUser={setUser} />}
            {mode === "chart" && <AnalyticsChart user={user} setUser={setUser} />}
            {mode === "users" && <AnalyticsUsers user={user} setUser={setUser} />}
        </div>
    );
}
