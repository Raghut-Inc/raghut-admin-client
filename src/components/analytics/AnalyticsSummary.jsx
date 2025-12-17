import React, { useEffect, useState } from 'react'

const AnalyticsSummary = () => {
    const API_BASE = `${process.env.REACT_APP_API_URL}/analytics`;

    const [userTypeSummary, setUserTypeSummary] = useState({
        totalUsers: 0,
        breakdown: {},
        rows: [],
    });

    const [userBasicSummary, setUserBasicSummary] = useState({
        totalUsers: 0,
        withProfilePic: 0,
        withBirthday: 0,
        uploadedAtLeastTwice: 0,
        ratios: {},
    });

    async function fetchJson(url) {
        const t0 = performance.now();
        const res = await fetch(url, { credentials: "include" });
        const t1 = performance.now();
        console.log(`[analytics] ${url} fetch ${(t1 - t0).toFixed(0)}ms`);
        if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
        const json = await res.json();
        const t2 = performance.now();
        console.log(`[analytics] ${url} json ${(t2 - t1).toFixed(0)}ms total ${(t2 - t0).toFixed(0)}ms`);
        return json;
    }

    useEffect(() => {
        const fetchUserTypeSummary = async () => {
            try {
                const res = await fetchJson(`${API_BASE}/user-type-summary`);
                if (res.success) {
                    setUserTypeSummary({
                        totalUsers: res.totalUsers || 0,
                        breakdown: res.breakdown || {},
                        rows: res.rows || [],
                    });
                } else {
                    console.error("Failed to load user-type summary:", res.error);
                }
            } catch (err) {
                console.error("Error fetching user-type summary:", err);
            }
        };

        fetchUserTypeSummary();
    }, [API_BASE]);

    // Fetch user basic summary — dynamic N
    useEffect(() => {
        const fetchUserBasicSummary = async () => {
            try {
                const res = await fetchJson(`${API_BASE}/user-basic-summary`);
                if (res.success) setUserBasicSummary(res);
            } catch (err) {
                console.error("Error fetching user-basic-summary:", err);
            }
        };
        fetchUserBasicSummary();
    }, [API_BASE]);

    const pct = (x) => `${(x * 100).toFixed(0)}%`;
    const Subheader = ({ title = "" }) => <h3 className="text-xs font-semibold text-gray-500 mb-3">{title}</h3>
    const Header = ({ title, subtitle }) => (
        < div className="flex space-x-1 p-2 w-full font-semibold items-center max-w-4xl" >
            <p className="font-semibold w-full text-gray-500">{title}</p>
            <p className="text-xs text-indigo-600 flex-shrink-0">{subtitle}</p>
        </div >
    )
    return (
        <div className="max-w-4xl w-full mx-auto pb-16 font-sans">

            {/* ---------- 사용자 기본 요약 ---------- */}
            <Header title="사용자 기본 요약" />

            <div className="mx-2 mb-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* Counts */}
                <div className="rounded-lg bg-white p-4">
                    <Subheader title="👤 기본 사용자 통계" />
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <div className="text-xs text-gray-500 mb-1">총 사용자 수</div>
                            <div className="text-xl font-semibold">
                                {userBasicSummary.totalUsers?.toLocaleString?.() ?? "–"}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 mb-1">구독 중인 사용자</div>
                            <div className="text-xl font-semibold">
                                {userBasicSummary.subscribedUsers?.toLocaleString?.() ?? "–"}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-3">
                        <div>
                            <div className="text-xs text-gray-500 mb-1">2명 이상 친구 있음</div>
                            <div className="text-xl font-semibold">
                                {userBasicSummary.hasAtLeastTwoFriends?.toLocaleString?.() ?? "–"}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 mb-1">프로필 사진 있음</div>
                            <div className="text-xl font-semibold">
                                {userBasicSummary.withProfilePic?.toLocaleString?.() ?? "–"}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-3">
                        <div>
                            <div className="text-xs text-gray-500 mb-1">생일 등록함</div>
                            <div className="text-xl font-semibold">
                                {userBasicSummary.withBirthday?.toLocaleString?.() ?? "–"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ratios */}
                <div className="rounded-lg bg-gray-50 p-4">
                    <Subheader title="📊 비율 (%)" />
                    <div className="grid grid-cols-2 gap-3 text-gray-600">
                        {Object.entries({
                            subscribedRatio: "구독 중인 사용자",
                            withProfilePic: "프로필 사진 있음",
                            withBirthday: "생일 등록함",
                            hasAtLeastTwoFriends: "2명 이상 친구 있음",
                        }).map(([key, label]) => (
                            <div key={key} className="space-y-1">
                                <div className="text-xs text-gray-500">{label}</div>
                                <div className="font-semibold">{pct(userBasicSummary.ratios?.[key] || 0)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Header title="사용자 유형 지표" />

            {/* ===== KPI Bar: User Types ===== */}
            <div className="mx-2 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {/* Absolute Counts */}
                    <div className="rounded-lg bg-white p-4">
                        <Subheader title="👥 유형별 사용자 수" />
                        <div className="grid grid-cols-4 gap-3">
                            <div>
                                <div className="text-xs text-gray-500 mb-1">공부러</div>
                                <div className="text-xl font-semibold">
                                    {userTypeSummary.breakdown?.study?.toLocaleString?.() ?? '–'}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-1">숙제러</div>
                                <div className="text-xl font-semibold">
                                    {userTypeSummary.breakdown?.homework?.toLocaleString?.() ?? '–'}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-1">반반</div>
                                <div className="text-xl font-semibold">
                                    {userTypeSummary.breakdown?.half?.toLocaleString?.() ?? '–'}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-1">미확인</div>
                                <div className="text-xl font-semibold">
                                    {userTypeSummary.breakdown?.other?.toLocaleString?.() ?? '–'}
                                </div>
                            </div>
                        </div>
                        <div className="mt-3 text-xs text-gray-400">
                            총 사용자 수: {userTypeSummary.totalUsers?.toLocaleString?.() ?? '–'}명
                        </div>
                    </div>

                    {/* Percentage Ratios */}
                    <div className="rounded-lg bg-gray-50 px-4 py-2">
                        <Subheader title="📊 사용자 비율 (%)" />
                        <div className="grid grid-cols-4 gap-3">
                            {[
                                { key: 'study', label: '공부러' },
                                { key: 'homework', label: '숙제러' },
                                { key: 'half', label: '반반' },
                                { key: 'other', label: '미확인' },
                            ].map(({ key, label }) => {
                                const count = userTypeSummary.breakdown?.[key] || 0;
                                const pct =
                                    userTypeSummary.totalUsers > 0
                                        ? ((count / userTypeSummary.totalUsers) * 100).toFixed(1)
                                        : '0.0';
                                return (
                                    <div key={key}>
                                        <div className="text-xs text-gray-500 mb-1">{label}</div>
                                        <div className="text-gray-500 font-semibold">{pct}%</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AnalyticsSummary