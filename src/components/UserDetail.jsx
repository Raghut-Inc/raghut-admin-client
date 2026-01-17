import React, { useEffect, useState } from "react";
import {
    FiX, FiCreditCard, FiUser, FiActivity,
    FiSmartphone, FiFileText
} from "react-icons/fi";

const UserDetail = ({ userId, onClose }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFullUser = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/analytics/users/${userId}`, {
                    credentials: "include",
                });
                const json = await res.json();
                if (json.success) {
                    setData(json.user);
                } else {
                    setError(json.error || "Failed to load");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (userId) fetchFullUser();
    }, [userId]);

    // ✅ HELPER: Calculate Korean School Grade
    const getKoreanSchoolGrade = (birthDateString) => {
        if (!birthDateString) return "";

        const birthDate = new Date(birthDateString);
        const today = new Date();

        const birthYear = birthDate.getFullYear();
        let currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1; // 1-12

        // In Korea, the academic year starts in March.
        // If it's Jan or Feb, we represent the grade based on the previous year 
        // (or clarify they are about to advance). 
        // Standard approach: Treat Jan/Feb as the previous academic year.
        if (currentMonth < 3) {
            currentYear -= 1;
        }

        // "School Age" index (Current Academic Year - Birth Year)
        // Born 2016 in 2024 (Academic): 2024 - 2016 = 8 -> Elementary 2
        // Formula: Index - 6 = Elementary Grade
        const academicAge = currentYear - birthYear;

        if (academicAge < 7) return "미취학"; // Preschool
        if (academicAge >= 7 && academicAge <= 12) return `초${academicAge - 6}`; // Elementary 1-6
        if (academicAge >= 13 && academicAge <= 15) return `중${academicAge - 12}`; // Middle 1-3
        if (academicAge >= 16 && academicAge <= 18) return `고${academicAge - 15}`; // High 1-3
        return "성인"; // Adult
    };

    // Helper to format birthday string
    const formatBirthday = (dateString) => {
        if (!dateString) return null;

        const date = new Date(dateString).toLocaleDateString("ko-KR", {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        const agePart = data.age ? `${data.age}세` : "";
        const zodiacPart = data.zodiacAnimal || "";
        const gradePart = getKoreanSchoolGrade(dateString); // ✅ Added Grade

        // Result: "2005년 5월 5일 (19세 / 고3) 🐔"
        return (
            <span>
                {date} <span className="text-gray-400">({agePart} {gradePart && `/ ${gradePart}`})</span> {zodiacPart}
            </span>
        );
    };

    if (!userId) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Side Drawer */}
            <div className="relative w-full max-w-3xl h-full bg-gray-900 border-l border-gray-700 shadow-2xl overflow-y-auto transform transition-transform duration-300">

                {/* Header */}
                <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur border-b border-gray-700 p-4 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <FiUser /> User Details
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition">
                        <FiX size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-6 pb-20">
                    {loading && (
                        <div className="flex justify-center py-10 text-gray-400 animate-pulse">
                            Loading full profile...
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {data && (
                        <>
                            {/* 1. Identity & Profile Section */}
                            <Section title="Profile Identity" icon={<FiUser />}>
                                <div className="flex items-center gap-3 mb-2">
                                    {data.profileImageUrl ? (
                                        <img src={data.profileImageUrl} alt="Profile" className="w-10 h-10 rounded-full bg-gray-700 object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xs"></div>
                                    )}
                                    <div>
                                        <div className="text-sm font-bold text-white">{data.name}</div>
                                        <div className="text-xs text-gray-400">@{data.username || "no_username"}</div>
                                    </div>
                                </div>
                                <hr className="border-white/5 my-2" />
                                <Field label="User ID" value={data._id} copy />
                                <Field label="Email" value={data.email} copy />
                                <Field label="Role" value={data.role} highlight={data.role === 'admin'} />
                                <Field label="Provider" value={data.provider} />

                                {/* New Profile Fields */}
                                <div className="grid grid-cols-2 gap-2 pt-2">
                                    <Field label="School" value={data.schoolName || "—"} />
                                    <Field label="Language" value={data.preferredLanguage === 'ko' ? "🇰🇷 Korean" : "🇺🇸 English"} />
                                </div>
                                {/* Birthday with Korean Grade */}
                                <Field label="Birthday" value={formatBirthday(data.birthday)} />
                            </Section>

                            {/* 2. Usage Stats (Counts & Type) */}
                            <Section title="Usage Stats" icon={<FiActivity />}>
                                <Field label="User Type" value={data.userType} className="capitalize font-semibold text-blue-300" />
                                <div className="grid grid-cols-3 gap-2 mt-2 bg-black/20 p-2 rounded-lg text-center">
                                    <div>
                                        <div className="text-[10px] text-gray-500">Uploads</div>
                                        <div className="text-sm font-bold text-white">{data.uploadCount || 0}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-500">Questions</div>
                                        <div className="text-sm font-bold text-white">{data.questionCount || 0}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-500">Friends</div>
                                        <div className="text-sm font-bold text-white">{data.friendCount || 0}</div>
                                    </div>
                                </div>
                                {data.dailyUsage?.date && (
                                    <Field label="Last Daily Usage" value={`${data.dailyUsage.date} (${data.dailyUsage.uploads} uploads)`} />
                                )}
                            </Section>

                            {/* 3. Custom Prompts (Added Fields) */}
                            <Section title="Custom AI Prompts" icon={<FiFileText />}>
                                {(!data.explanation && !data.followUp) && <div className="text-xs text-gray-500 italic">No custom prompts set.</div>}

                                <Field
                                    label="Explanation Prompt"
                                    value={data.explanation}
                                    className="whitespace-pre-wrap font-mono text-[11px] bg-black/30 p-2 rounded border border-white/5 text-gray-300"
                                />
                                <Field
                                    label="Follow Up Prompt"
                                    value={data.followUp}
                                    className="whitespace-pre-wrap font-mono text-[11px] bg-black/30 p-2 rounded border border-white/5 text-gray-300"
                                />
                            </Section>

                            {/* 4. Subscription & Keys */}
                            <Section title="Subscription & Keys" icon={<FiCreditCard />}>
                                <div className="grid grid-cols-2 gap-4 mb-2">
                                    <Field label="Status" value={data.subscriptionStatus}
                                        highlight={data.isPro}
                                        className={data.isPro ? "text-green-400 uppercase" : "text-gray-400 uppercase"}
                                    />
                                    <Field label="Type" value={data.subscriptionType} />
                                </div>
                                {data.subscriptionExpiresAt && (
                                    <Field label="Expires At" value={new Date(data.subscriptionExpiresAt).toLocaleString()} />
                                )}
                                <hr className="border-white/5 my-2" />
                                <Field label="RevenueCat ID" value={data.revenuecatUserId} copy />
                                {data.googleId && <Field label="Google ID" value={data.googleId} copy />}
                                {data.appleId && <Field label="Apple ID" value={data.appleId} copy />}
                                {data.kakaoId && <Field label="Kakao ID" value={data.kakaoId} copy />}
                            </Section>

                            {/* 5. Client & Devices */}
                            <Section title="Client Info" icon={<FiSmartphone />}>
                                {/* Last Client Info Object */}
                                {data.lastClient && (
                                    <div className="bg-blue-500/10 p-2 rounded mb-3 border border-blue-500/20">
                                        <div className="text-[10px] text-blue-300 font-bold mb-1">MOST RECENT SESSION</div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Field label="App Version" value={data.lastClient.appVersion} />
                                            <Field label="Platform" value={data.lastClient.platform} />
                                            <Field label="Last IP" value={data.lastClient.lastIP} />
                                            <Field label="Seen At" value={data.lastClient.at ? new Date(data.lastClient.at).toLocaleDateString() : '-'} />
                                        </div>
                                    </div>
                                )}

                                {/* Device List */}
                                <div className="space-y-2">
                                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Device History</div>
                                    {data.devices?.length === 0 && <div className="text-xs text-gray-500">No device history.</div>}
                                    {data.devices?.map((d, i) => (
                                        <div key={i} className="bg-gray-800/50 p-2 rounded text-xs border border-gray-700">
                                            <div className="flex justify-between text-gray-300 font-semibold">
                                                <span>{d.platform}</span>
                                                <span>{new Date(d.lastSeenAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="text-gray-500 mt-1 break-all truncate">{d.userAgent}</div>
                                            {d.pushToken && <div className="text-[9px] text-gray-600 mt-1 truncate">Push: {d.pushToken}</div>}
                                        </div>
                                    ))}
                                </div>
                            </Section>

                            {/* 6. Raw JSON Dump */}
                            <div className="pt-4 border-t border-gray-700">
                                <details className="group">
                                    <summary className="cursor-pointer text-xs font-mono text-gray-500 hover:text-gray-300 select-none">
                                        View Raw JSON
                                    </summary>
                                    <pre className="mt-2 p-3 bg-black rounded-lg text-[10px] text-green-400 overflow-x-auto font-mono leading-tight shadow-inner">
                                        {JSON.stringify(data, null, 2)}
                                    </pre>
                                </details>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// Sub-components
const Section = ({ title, icon, children }) => (
    <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            {icon} {title}
        </h3>
        <div className="bg-white/5 rounded-lg p-3 space-y-3 border border-white/5 shadow-sm">
            {children}
        </div>
    </div>
);

const Field = ({ label, value, copy, highlight, className = "" }) => {
    const handleCopy = () => {
        if (value) navigator.clipboard.writeText(value);
    };

    if (!value && value !== 0) return null;

    return (
        <div className="group min-w-0">
            <div className="text-[10px] text-gray-500 mb-0.5">{label}</div>
            <div
                onClick={copy ? handleCopy : undefined}
                className={`text-sm break-words flex items-center gap-2 ${copy ? 'cursor-pointer hover:text-blue-400 transition' : ''} ${highlight ? 'font-bold text-white' : 'text-gray-300'} ${className}`}
            >
                <span className="truncate w-full block">{value}</span> {/* Removed String() to allow jsx */}
                {copy && <span className="opacity-0 group-hover:opacity-100 text-[9px] bg-gray-700 px-1 py-0.5 rounded text-white flex-shrink-0">COPY</span>}
            </div>
        </div>
    );
};

export default UserDetail;