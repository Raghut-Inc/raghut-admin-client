const UploadsListItem = ({ q, qIndex }) => {
    // Helper: timeAgo function (same as in UploadsCard)
    function timeAgo(dateString) {
        const now = new Date();
        const past = new Date(dateString);
        const diffMs = now - past; // difference in milliseconds

        const seconds = Math.floor(diffMs / 1000);
        if (seconds < 60) return `${seconds}초 전`;

        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}분 전`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}시간 전`;

        const days = Math.floor(hours / 24);
        if (days < 30) return `${days}일 전`;

        const months = Math.floor(days / 30);
        if (months < 12) return `${months}개월 전`;

        const years = Math.floor(months / 12);
        return `${years}년 전`;
    }

    // Shorten user agent for display
    const shortUserAgent = (() => {
        if (!q.metadata?.userAgent) return '';
        const ua = q.metadata.userAgent;
        if (ua.includes('CFNetwork') && ua.includes('Darwin')) return ' iOS App';
        return ua;
    })();

    return (
        <li
            key={q._id || qIndex}
            className="flex items-center gap-3 p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-300"
        >

            <a href={q.imageUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                <img
                    src={q.imageUrl}
                    alt={`질문 이미지 ${qIndex + 1}`}
                    className="w-12 h-12 object-cover rounded-md"
                    loading="lazy"
                />
            </a>
            <div className="flex flex-col flex-1 overflow-hidden text-xs">
                <span className="text-gray-600 font-semibold truncate" title={q.metadata?.userInfo || ''}>
                    <span>{q.metadata.userInfo === "Unauthenticated user" ? "비회원" : q.metadata.userInfo} ({q.metadata.ip})</span>
                </span>

                <span className="text-gray-600 line-clamp-2 w-full" title={shortUserAgent}>
                    {shortUserAgent || '기기 정보 없음'}
                </span>
            </div>
            <div className="flex flex-col items-end text-xs text-gray-500 whitespace-nowrap min-w-[70px] space-y-0.5">
                <span>{timeAgo(q.createdAt)}</span>
                <span style={{fontSize:10}}>{new Date(q.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

        </li>
    );
};

export default UploadsListItem;
