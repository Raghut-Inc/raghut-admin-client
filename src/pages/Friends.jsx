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
        <div className="max-w-3xl mx-auto py-10">
            {/* 상단 헤더: 타이틀과 카운트 */}
            <div className="flex items-end justify-between mb-8 pb-4 border-b-2 border-slate-900/5">
                <div className="flex items-center gap-3">
                    <div className="bg-slate-900 p-2 rounded-xl">
                        <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">친구 추가</h2>
                    </div>
                </div>
                {!friendsLoading && (
                    <span className="text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
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
                <div className="text-center py-24">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-400 font-medium">최근 활동이 없습니다.</p>
                </div>
            ) : (
                <div className="space-y-1 divide-y">
                    {friendActivity.map((f, i) => (
                        <div
                            key={i}
                            className="group flex items-center justify-between py-2 text-sm"
                        >
                            <div className="flex items-center gap-5">
                                {/* 아바타 커넥션 커스텀 디자인 */}
                                <div className="relative flex items-center shrink-0">
                                    <div className="relative z-10">
                                        <UserAvatar user={f.a} />
                                    </div>
                                    <div className="w-8 h-[2px] bg-slate-200 -mx-1" /> {/* 연결선 */}
                                    <div className="relative z-10">
                                        <UserAvatar user={f.b} />
                                    </div>
                                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-0.5 border border-slate-100 z-20">
                                        <ArrowRightLeft className="w-3 h-3 text-slate-400" />
                                    </div>
                                </div>

                                {/* 활동 텍스트 정보 */}
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <button
                                        onClick={() => openAdminSearch(f.a?._id)}
                                        className="text-left font-bold text-slate-900 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors flex items-center"
                                    >
                                        {f.a?.username || f.a?.name || "사용자"}
                                    </button>
                                    <span className="text-slate-400 text-sm font-medium px-1">&</span>
                                    <button
                                        onClick={() => openAdminSearch(f.b?._id)}
                                        className="text-left font-bold text-slate-900 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors flex items-center"
                                    >
                                        {f.b?.username || f.b?.name || "사용자"}
                                    </button>
                                </div>
                            </div>

                            {/* 시간 정보 - 우측 배치 */}
                            <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-400">
                                    <Clock size={12} className="text-slate-300" />
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

// 개선된 아바타 컴포넌트
const UserAvatar = ({ user }) => (
    <div className="w-11 h-11 rounded-2xl border bg-white overflow-hidden shrink-0">
        {user?.profileImageUrl ? (
            <img
                src={user.profileImageUrl}
                alt=""
                className="w-full h-full object-cover"
            />
        ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 font-bold text-xs">
                {user?.username?.substring(0, 1).toUpperCase() || "U"}
            </div>
        )}
    </div>
);

export default Friends;