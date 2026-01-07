import React, { useEffect, useState } from "react";
import { timeAgo } from "../utils/timeAgo";
import { Users, Clock, ArrowRightLeft } from "lucide-react";

const Friends = () => {
    const [friendActivity, setFriendActivity] = useState([]);
    const [friendsLoading, setFriendsLoading] = useState(true);

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                setFriendsLoading(true);
                const res = await fetch(`${process.env.REACT_APP_API_URL}/analytics/friend-activity?limit=50`, {
                    credentials: "include",
                });
                const data = await res.json();
                if (data.data) setFriendActivity(data.data);
            } catch (err) {
                console.error("❌ 친구 활동 로드 실패:", err);
            } finally {
                setFriendsLoading(false);
            }
        };
        fetchFriends();
    }, []);

    const openAdminSearch = (userId) => {
        if (!userId) return;
        const url = `http://localhost:3000/admin/search?q=${userId}`;
        window.open(url, "_blank", "noopener,noreferrer");
    };

    return (
        // 모바일 대응: px-4 추가로 양옆 여백 확보
        <div className="max-w-3xl mx-auto py-6 md:py-10 px-4">
            {/* 상단 헤더 */}
            <div className="flex items-end justify-between mb-6 md:mb-8 pb-4 border-b-2 border-slate-900/5">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="bg-slate-900 p-2 rounded-lg md:rounded-xl">
                        <Users className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">친구 활동</h2>
                </div>
                {!friendsLoading && (
                    <span className="text-[10px] md:text-xs font-bold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">
                        최근 {friendActivity.length}개
                    </span>
                )}
            </div>

            {/* 메인 리스트 */}
            {friendsLoading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 w-full bg-slate-100 animate-pulse rounded-2xl" />
                    ))}
                </div>
            ) : friendActivity.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-slate-400 font-medium">최근 활동이 없습니다.</p>
                </div>
            ) : (
                <div className="space-y-1 divide-y divide-slate-50">
                    {friendActivity.map((f, i) => (
                        <div
                            key={i}
                            // 모바일 대응: justify-between 유지하되 내부 요소 간격 조정
                            className="group flex items-center justify-between py-4 sm:py-3 text-sm"
                        >
                            <div className="flex items-center gap-3 md:gap-5 min-w-0">
                                {/* 아바타 커넥션: 모바일에서 크기 축소 (w-9) */}
                                <div className="relative flex items-center shrink-0">
                                    <button onClick={() => openAdminSearch(f.a?._id)}
                                        className="relative z-10">
                                        <UserAvatar user={f.a} />
                                    </button>
                                    <div className="w-4 md:w-8 h-[1px] md:h-[2px] bg-slate-200 -mx-0.5" />
                                    <button onClick={() => openAdminSearch(f.b?._id)}
                                        className="relative z-10">
                                        <UserAvatar user={f.b} />
                                    </button>
                                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-0.5 border border-slate-100 z-20 shadow-sm">
                                        <ArrowRightLeft className="w-2.5 h-2.5 text-slate-400" />
                                    </div>
                                </div>

                                {/* 활동 텍스트 정보: min-w-0와 truncate로 긴 이름 대응 */}
                                <div className="flex overflow-hidden flex-col items-start">
                                    <button
                                        onClick={() => openAdminSearch(f.a?._id)}
                                        className="font-semibold text-slate-900 hover:text-blue-600"
                                    >
                                        {f.a?.username || f.a?.name || "사용자"}
                                    </button>
                                    <button
                                        onClick={() => openAdminSearch(f.b?._id)}
                                        className="font-semibold text-slate-900 hover:text-blue-600"
                                    >
                                        {f.b?.username || f.b?.name || "사용자"}
                                    </button>
                                </div>
                            </div>

                            {/* 시간 정보: 우측 고정 및 줄바꿈 방지 */}
                            <div className="shrink-0 ml-2">
                                <div className="flex items-center gap-1 text-[11px] md:text-xs font-medium text-slate-400 whitespace-nowrap">
                                    <Clock size={10} className="text-slate-300" />
                                    {timeAgo(f.updatedAt)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// 아바타 컴포넌트: 모바일에서 w-9, 데스크탑에서 w-11
const UserAvatar = ({ user }) => (
    <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl border bg-white overflow-hidden shrink-0 shadow-sm">
        {user?.profileImageUrl ? (
            <img
                src={user.profileImageUrl}
                alt=""
                className="w-full h-full object-cover"
            />
        ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-slate-400 font-bold text-[10px] md:text-xs">
                {user?.username?.substring(0, 1).toUpperCase() || "U"}
            </div>
        )}
    </div>
);

export default Friends;