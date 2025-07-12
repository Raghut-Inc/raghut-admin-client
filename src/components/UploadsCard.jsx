import { useState } from 'react';

const UploadsCard = ({ q, qIndex, onDelete }) => {
    const [expanded, setExpanded] = useState({}); // { "qIndex-i": true }

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

    const toggleExpand = (key) => {
        setExpanded((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    return (
        <div key={qIndex} className="max-w-xl overflow-hidden shadow-sm bg-white w-full">
            <div className={`${(q.gptAnalyzed?.[0]?.questionText.includes("문제가 감지되지 않았습니다") || q.gptAnalyzed?.length === 0) ? "bg-red-500" : "bg-indigo-500"} text-white text-xs font-medium px-3 py-1.5 flex justify-between`}>
                <span>{(q.gptAnalyzed?.[0]?.questionText.includes("문제가 감지되지 않았습니다") || q.gptAnalyzed?.length === 0) ? "문제 인식 안됨" : `${q.gptAnalyzed?.length || 0} 문제 인식됨`}</span>
                <span>{timeAgo(q.createdAt)} ({new Date(q.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })})</span>
            </div>
            <div className='flex flex-col w-full bg-gray-800'>
                <div className="relative">

                    <div className='relative'>
                        <a href={q.imageUrl} target="_blank" rel="noopener noreferrer">
                            <img
                                src={q.imageUrl}
                                alt="Captured"
                                className="w-full max-h-64 object-contain object-center cursor-pointer"
                            />
                        </a>
                        <div
                            onClick={e => e.stopPropagation()}
                            className="absolute bottom-2 right-2 bg-black/65 text-white text-xs rounded-full px-3 py-1"
                        >
                            <p>{q._id}</p>
                        </div>
                        <div
                            onClick={e => {
                                e.stopPropagation()
                                onDelete(q._id);
                            }}
                            className="absolute top-2 right-2 bg-red-500/65 text-white text-xs rounded-full px-3 py-1"
                        >
                            <p>삭제</p>
                        </div>
                    </div>


                    <div className="bg-gray-700 text-xs text-white space-y-1 p-3">

                        {/* Uploader info */}
                        {q.userId ? (
                            <div className="bg-gray-700 rounded-md text-xs text-white space-y-1">
                                <div className="flex flex-col truncate max-w-xs space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`px-1.5 py-0.5 rounded text-xs font-mono ${q.userId.role === 'admin'
                                                ? 'bg-indigo-300 text-indigo-900'
                                                : 'bg-gray-600 text-gray-200'
                                                }`}
                                            title="Role"
                                        >
                                            {q.userId.role?.toUpperCase() || 'USER'}
                                        </span>
                                        <span className="font-semibold truncate">{q.userId.name || 'Unnamed User'}</span>

                                    </div>

                                    <div className="text-xs text-gray-400 truncate max-w-xs font-mono">
                                        {q.userId._id}
                                    </div>

                                    <div className="flex flex-wrap gap-2 text-xs text-gray-300 truncate max-w-xs">
                                        <span
                                            className="cursor-pointer underline decoration-dotted truncate"
                                            title="Click to copy email"
                                            onClick={() =>
                                                q.userId.email && navigator.clipboard.writeText(q.userId.email)
                                            }
                                        >
                                            {q.userId.email || 'No email'}
                                        </span>

                                        <span>∙</span>

                                        <span
                                            className="font-mono cursor-pointer underline decoration-dotted truncate"
                                            title="Click to copy referral ID"
                                            onClick={() =>
                                                q.userId.referralId &&
                                                navigator.clipboard.writeText(q.userId.referralId)
                                            }
                                        >
                                            초대코드: {q.userId.referralId || '-'}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1 truncate max-w-xs font-mono">
                                        가입일:{' '}
                                        {q.userId.createdAt
                                            ? new Date(q.userId.createdAt).toLocaleDateString()
                                            : '-'}{' '}
                                        ({timeAgo(q.userId.createdAt)})
                                    </div>

                                    <div className="text-xs mt-1 text-gray-400 truncate max-w-xs font-mono">
                                        로그인 방식: {q.userId.provider || '-'}
                                    </div>
                                    <div className="mt-1 text-xs text-gray-400 truncate max-w-xs font-mono">
                                        IP: {q.metadata?.ip || '-'}
                                    </div>

                                    <div className="mt-1 text-xs text-gray-400 truncate max-w-xs font-mono">
                                        <span className="min-w-[60px]">기종: </span>
                                        <span>
                                            {q.metadata.userAgent.includes('CFNetwork') &&
                                                q.metadata.userAgent.includes('Darwin')
                                                ? ' Apple iOS App'
                                                : q.metadata.userAgent}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-1 text-xs border-t pt-1 border-gray-500 border-dashed">
                                        <span
                                            className={`inline-block px-2 py-0.5 rounded-full font-mono ${{
                                                active: 'bg-green-200 text-green-800',
                                                canceled: 'bg-yellow-200 text-yellow-800',
                                                expired: 'bg-red-200 text-red-800',
                                                none: 'bg-gray-300 text-gray-700',
                                            }[q.userId.subscriptionStatus || 'none']
                                                }`}
                                            title="Subscription status"
                                        >
                                            구독: {q.userId.subscriptionStatus || 'none'}
                                        </span>

                                        <span className="text-gray-300 font-mono">
                                            타입: {q.userId.subscriptionType || '-'}
                                        </span>

                                        <span className="text-gray-300 font-mono truncate max-w-xs">
                                            만료:{' '}
                                            {q.userId.subscriptionExpiresAt
                                                ? new Date(q.userId.subscriptionExpiresAt).toLocaleDateString()
                                                : '-'}
                                        </span>
                                    </div>
                                </div>

                            </div>
                        ) : q.metadata?.userInfo ? (
                            <div className="bg-gray-700 rounded-md text-xs text-white space-y-2">
                                <span className="min-w-[60px]">정보: </span>
                                <span>
                                    {q.metadata.userInfo === 'Unauthenticated user'
                                        ? '비회원'
                                        : q.metadata.userInfo}{' '}
                                    ({q.metadata.ip})
                                </span>
                                <div className="mt-1 text-xs text-gray-400 truncate max-w-xs font-mono">
                                    <span className="min-w-[60px]">기종: </span>
                                    <span>
                                        {q.metadata.userAgent.includes('CFNetwork') &&
                                            q.metadata.userAgent.includes('Darwin')
                                            ? ' Apple iOS App'
                                            : q.metadata.userAgent}
                                    </span>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
                <div className="flex-1 text-xs">
                    {q.gptAnalyzed.map((item, i) => {
                        const key = `${qIndex}-${i}`;
                        const isOpen = expanded[key];
                        return (
                            <div key={i} className="bg-gray-50 p-3 border-l-4 border-b-4 border-r-4 border-gray-700">
                                <div className='relative w-full h-full'>
                                    <p className="font-semibold">{item.questionText}</p>
                                    <ul className="mt-2 pl-4 list-disc">
                                        {item.answers.map((a, j) => {
                                            const isCorrect = item.correctAnswers?.some(
                                                (correct) => correct.answerOption === a.answerOption
                                            );
                                            return (
                                                <li
                                                    key={j}
                                                    className={isCorrect ? 'font-bold text-green-600' : 'text-gray-500'}
                                                >
                                                    {a.answerOption}. {a.answerText}{' '}({a.answerInKorean})
                                                </li>
                                            );
                                        })}
                                    </ul>

                                    <button
                                        className="mt-2 text-sm text-white underline absolute bottom-0 right-0 w-10 h-10 bg-gray-700 rounded-full"
                                        onClick={() => toggleExpand(key)}
                                    >
                                        {isOpen ? '▼' : '▲'}
                                    </button>
                                </div>

                                {isOpen && (
                                    <div className="mt-3 space-y-2 text-xs text-gray-700">
                                        <p className="text-xs text-gray-500">🈶 {item.questionInKorean}</p>

                                        <div className="bg-white border rounded-md p-3 space-y-1">
                                            <p><strong>📌 문법 포인트:</strong> {item.explanation.grammarPoint}</p>
                                            <p><strong>📖 문장 해석:</strong> {item.explanation.sentenceInterpretation}</p>
                                            <p><strong>🧠 문맥상 적절성:</strong> {item.explanation.contextFit}</p>
                                            <p><strong>🧩 표현/자연스러움:</strong> {item.explanation.collocationOrUsage}</p>
                                            <p><strong>✅ 기억할 점:</strong> {item.explanation.takeaway}</p>
                                        </div>

                                        {item.wrongChoices?.length > 0 && (
                                            <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-3">
                                                <p className="font-semibold text-red-500 mb-2">❌ 틀린 선택지 설명</p>
                                                <ul className="space-y-2">
                                                    {item.wrongChoices.map((wc, idx) => (
                                                        <li key={idx}>
                                                            <p><strong>{wc.answerOption}</strong> - {wc.reason}</p>
                                                            <p className="text-xs text-gray-500 ml-2">🔎 제거 전략: {wc.eliminationStrategy}</p>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {item.vocabTips?.length > 0 && (
                                            <div className="mt-4 text-sm">
                                                <p className="font-semibold text-blue-600">📚 단어 정리</p>
                                                <ul className="pl-4 list-disc mt-1 space-y-1">
                                                    {item.vocabTips.map((v, k) => (
                                                        <li key={k}>
                                                            <strong>{v.word}</strong>: {v.meaning}{' '}
                                                            <span className="text-gray-500">({v.note})</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {q.extractedContent && (
                                            <div className="mt-2 text-xs text-gray-400">
                                                🧾 OCR 원문: {q.extractedContent}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default UploadsCard;
