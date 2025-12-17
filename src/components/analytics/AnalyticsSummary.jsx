import React, { useEffect, useState } from 'react'

const AnalyticsSummary = () => {
    const API_BASE = `${process.env.REACT_APP_API_URL}/analytics`;
    const TZ = "UTC";

    const [calendarStats, setCalendarStats] = useState(null);
    const [rollingStats, setRollingStats] = useState(null);

    const [calendarSignup, setCalendarSignup] = useState(null);
    const [rollingSignup, setRollingSignup] = useState(null);

    const [userTypeSummary, setUserTypeSummary] = useState({
        totalUsers: 0,
        breakdown: {},
        rows: [],
    });

    const [calendarUpload, setCalendarUpload] = useState(null);
    const [rollingUpload, setRollingUpload] = useState(null);

    const [userBasicSummary, setUserBasicSummary] = useState({
        totalUsers: 0,
        withProfilePic: 0,
        withBirthday: 0,
        uploadedAtLeastTwice: 0,
        ratios: {},
    });

    const [, setError] = useState(null);

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

    // Fetch DAU/WAU/MAU
    useEffect(() => {
        const fetchBoth = async () => {
            try {
                const [calendarRes, rollingRes] = await Promise.all([
                    fetchJson(`${API_BASE}/dau-wau-mau?mode=calendar&tz=${TZ}`),
                    fetchJson(`${API_BASE}/dau-wau-mau?mode=rolling&tz=${TZ}`),
                ]);

                setCalendarStats({
                    dau: calendarRes.dau || 0,
                    wau: calendarRes.wau || 0,
                    mau: calendarRes.mau || 0,
                    ratios: calendarRes.ratios || {},
                });

                setRollingStats({
                    dau: rollingRes.dau || 0,
                    wau: rollingRes.wau || 0,
                    mau: rollingRes.mau || 0,
                    ratios: rollingRes.ratios || {},
                });
            } catch (err) {
                setError(err.message);
            }
        };

        fetchBoth();
    }, [API_BASE, TZ]);

    // Fetch signup summary (today / this week / this month)
    useEffect(() => {
        const fetchSignupSummary = async () => {
            try {
                const [calendarRes, rollingRes] = await Promise.all([
                    fetchJson(`${API_BASE}/signup-summary?mode=calendar&tz=${TZ}`),
                    fetchJson(`${API_BASE}/signup-summary?mode=rolling&tz=${TZ}`),
                ]);

                setCalendarSignup({
                    today: calendarRes.today || 0,
                    thisWeek: calendarRes.thisWeek || 0,
                    thisMonth: calendarRes.thisMonth || 0,
                });

                setRollingSignup({
                    today: rollingRes.today || 0,
                    thisWeek: rollingRes.thisWeek || 0,
                    thisMonth: rollingRes.thisMonth || 0,
                });
            } catch (err) {
                setError(err.message);
            }
        };

        fetchSignupSummary();
    }, [API_BASE, TZ]);

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

    useEffect(() => {
        const fetchUploadSummary = async () => {
            try {
                const [calendarRes, rollingRes] = await Promise.all([
                    fetchJson(`${API_BASE}/upload-summary?mode=calendar&tz=${TZ}`),
                    fetchJson(`${API_BASE}/upload-summary?mode=rolling&tz=${TZ}`),
                ]);

                setCalendarUpload({
                    today: calendarRes.today || {},
                    thisWeek: calendarRes.thisWeek || {},
                    thisMonth: calendarRes.thisMonth || {},
                });

                setRollingUpload({
                    today: rollingRes.today || {},
                    thisWeek: rollingRes.thisWeek || {},
                    thisMonth: rollingRes.thisMonth || {},
                });
            } catch (err) {
                setError(err.message);
            }
        };

        fetchUploadSummary();
    }, [API_BASE, TZ]);

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

            <Header title="활성 지표" subtitle={`TZ: ${TZ} (9시 리셋)`} />

            {/* ===== KPI Bar: DAU / WAU / MAU ===== */}
            <div className="mx-2 mb-4">
                {/* ==== GRID: Rolling vs Calendar ==== */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

                    {/* Calendar Mode */}
                    <div className="rounded-lg bg-white p-4">
                        <Subheader title="📅 Calendar (이번 주·달)" />
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <div className="text-xs text-gray-500 mb-1">DAU</div>
                                <div className="text-2xl font-semibold">{calendarStats?.dau ?? '-'}</div>
                                <div className="mt-1 text-xs text-gray-500">
                                    D/W <b>{pct(calendarStats?.ratios?.dauWau || 0)}</b><br />
                                    D/M <b>{pct(calendarStats?.ratios?.dauMau || 0)}</b>
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-1">WAU</div>
                                <div className="text-2xl font-semibold">{calendarStats?.wau ?? '-'}</div>
                                <div className="mt-1 text-xs text-gray-500">
                                    W/M <b>{pct(calendarStats?.ratios?.wauMau || 0)}</b>
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-1">MAU</div>
                                <div className="text-2xl font-semibold">{calendarStats?.mau ?? '-'}</div>
                                <div className="mt-1 text-xs text-gray-500">이달</div>
                            </div>
                        </div>
                    </div>

                    {/* Rolling Mode */}
                    <div className="rounded-lg bg-gray-50 px-4 py-2">
                        <Subheader title="📈 Rolling (최근 7·30일)" />
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <div className="text-xs text-gray-500 mb-1">DAU</div>
                                <div className="text-lg font-semibold text-gray-500">{rollingStats?.dau ?? '-'}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-1">WAU</div>
                                <div className="text-lg font-semibold text-gray-500">{rollingStats?.wau ?? '-'}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-1">MAU</div>
                                <div className="text-lg font-semibold text-gray-500">{rollingStats?.mau ?? '-'}</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <Header title="업로드 지표" />

            {/* ===== KPI Bar: Uploads ===== */}
            <div className="mx-2 mb-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* Calendar */}
                <div className="rounded-lg bg-white p-4">
                    <Subheader title="📅 Calendar (이번 주·달)" />
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <div className="text-xs text-gray-500 mb-1">오늘</div>
                            <div className="text-xl font-semibold">
                                {calendarUpload?.today?.uploads?.toLocaleString?.() ?? '-'}
                            </div>
                            <div className="text-xs text-gray-500">
                                문제 {calendarUpload?.today?.questions?.toLocaleString?.() ?? '-'}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 mb-1">이번 주</div>
                            <div className="text-xl font-semibold">
                                {calendarUpload?.thisWeek?.uploads?.toLocaleString?.() ?? '-'}
                            </div>
                            <div className="text-xs text-gray-500">
                                문제 {calendarUpload?.thisWeek?.questions?.toLocaleString?.() ?? '-'}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 mb-1">이번 달</div>
                            <div className="text-xl font-semibold">
                                {calendarUpload?.thisMonth?.uploads?.toLocaleString?.() ?? '-'}
                            </div>
                            <div className="text-xs text-gray-500">
                                문제 {calendarUpload?.thisMonth?.questions?.toLocaleString?.() ?? '-'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rolling */}
                <div className="rounded-lg bg-gray-50 px-4 py-2">
                    <Subheader title="📈 Rolling (최근 7·30일)" />
                    <div className="grid grid-cols-3 gap-3 text-gray-500">
                        <div>
                            <div className="text-xs text-gray-500 mb-1">최근 1일</div>
                            <div className="text-lg font-semibold">
                                {rollingUpload?.today?.uploads?.toLocaleString?.() ?? '-'}
                            </div>
                            <div className="text-xs text-gray-500">
                                문제 {rollingUpload?.today?.questions?.toLocaleString?.() ?? '-'}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 mb-1">최근 7일</div>
                            <div className="text-lg font-semibold">
                                {rollingUpload?.thisWeek?.uploads?.toLocaleString?.() ?? '-'}
                            </div>
                            <div className="text-xs text-gray-500">
                                문제 {rollingUpload?.thisWeek?.questions?.toLocaleString?.() ?? '-'}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 mb-1">최근 30일</div>
                            <div className="text-lg font-semibold">
                                {rollingUpload?.thisMonth?.uploads?.toLocaleString?.() ?? '-'}
                            </div>
                            <div className="text-xs text-gray-500">
                                문제 {rollingUpload?.thisMonth?.questions?.toLocaleString?.() ?? '-'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Header title="신규 유저 지표" />

            {/* ===== KPI Bar: Signups ===== */}
            <div className="mx-2 mb-4">
                {/* ==== GRID: Rolling vs Calendar ==== */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {/* Calendar Mode */}
                    <div className="rounded-lg bg-white p-4">
                        <Subheader title="📅 Calendar (이번 주·달)" />
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <div className="text-xs text-gray-500 mb-1">오늘</div>
                                <div className="text-2xl font-semibold">
                                    {calendarSignup?.today?.toLocaleString?.() ?? '-'}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-1">이번 주</div>
                                <div className="text-2xl font-semibold">
                                    {calendarSignup?.thisWeek?.toLocaleString?.() ?? '-'}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-1">이번 달</div>
                                <div className="text-2xl font-semibold">
                                    {calendarSignup?.thisMonth?.toLocaleString?.() ?? '-'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rolling Mode */}
                    <div className="rounded-lg bg-gray-50 px-4 py-2">
                        <Subheader title="📈 Rolling (최근 7·30일)" />
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <div className="text-xs text-gray-500 mb-1">최근 1일</div>
                                <div className="text-lg text-gray-500 font-semibold">
                                    {rollingSignup?.today?.toLocaleString?.() ?? '-'}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-1">최근 7일</div>
                                <div className="text-lg text-gray-500 font-semibold">
                                    {rollingSignup?.thisWeek?.toLocaleString?.() ?? '-'}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-1">최근 30일</div>
                                <div className="text-lg text-gray-500 font-semibold">
                                    {rollingSignup?.thisMonth?.toLocaleString?.() ?? '-'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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