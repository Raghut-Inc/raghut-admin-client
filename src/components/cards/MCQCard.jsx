import { useState } from 'react';
import QuestionMetaInfo from './QuestionMetaInfo';
import { timeAgo } from '../../utils/timeAgo';

const UploadsCard = ({ q, qIndex, onDelete }) => {
    const [expanded, setExpanded] = useState({}); // { "qIndex-i": true }

    const toggleExpand = (key) => {
        setExpanded((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    function formatExplanation(explanation) {
        if (!explanation) return "";

        if (typeof explanation === "string") {
            return explanation;
        }

        // Explanation is an object — combine keys
        return [
            explanation.grammarPoint && `${explanation.grammarPoint}`,
            explanation.sentenceInterpretation && `${explanation.sentenceInterpretation}`,
            explanation.contextFit && `${explanation.contextFit}`,
            explanation.collocationOrUsage && `${explanation.collocationOrUsage}`,
            explanation.takeaway && `${explanation.takeaway}`,
        ]
            .filter(Boolean) // remove undefined/null
            .join("\n");
    }


    return (
        <div key={qIndex} className="max-w-xl overflow-hidden shadow-sm bg-white w-full">
            <div className={`${(q.gptAnalyzed?.[0]?.questionText.includes("문제가 감지되지 않았습니다") || q.gptAnalyzed?.length === 0) ? "bg-red-500" : "bg-indigo-500"} text-white text-xs font-medium px-3 py-1.5 flex justify-between`}>
                <span>{(q.gptAnalyzed?.[0]?.questionText.includes("문제가 감지되지 않았습니다") || q.gptAnalyzed?.length === 0) ? "문제 인식 안됨" : `${q.gptAnalyzed?.length || 0} 문제 인식됨`}</span>
                {q.processingTimeMs && (<span>{(q.processingTimeMs / 1000).toFixed(1)}초</span>)}
                <span>{timeAgo(q.createdAt)} ({new Date(q.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })})</span>
            </div>

            <div className="flex flex-col w-full bg-gray-800 p-3 text-white text-xs space-y-3">
                {/* Image preview */}
                <QuestionMetaInfo q={q} onDelete={onDelete} timeAgo={timeAgo} />

                <div className="flex-1 text-xs text-black rounded overflow-hidden">
                    {q.gptAnalyzed?.map((item, i) => {
                        const key = `${qIndex}-${i}`;
                        const isOpen = expanded[key];
                        return (
                            <div key={i} className="bg-gray-50 p-3">
                                <div className='relative w-full h-full'>
                                    <p className='text-gray-500 font-medium'>[{item.questionType}]</p>
                                    <p className="font-semibold">{item.questionNumber}. {item.questionText}</p>
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
                                        className="text-indigo-700 underline absolute bottom-0 right-0 text-xs"
                                        onClick={() => toggleExpand(key)}
                                    >
                                        {isOpen ? "접기 ▲" : "더보기 ▼"}
                                    </button>
                                </div>

                                {isOpen && (
                                    <div className="mt-3 text-xs whitespace-pre-line border-t border-gray-300 pt-2">
                                        <p style={{ whiteSpace: 'pre-line' }}>
                                            {formatExplanation(item.explanation)}
                                        </p>
                                        {item.wrongChoices?.length > 0 && (
                                            <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-3">
                                                <p className="font-semibold text-red-500 mb-2">오답</p>
                                                <ul className="space-y-2">
                                                    {item.wrongChoices.map((wc, idx) => (
                                                        <li key={idx}>
                                                            <p><strong>{wc.answerOption}</strong> - {wc.reason}</p>
                                                        </li>
                                                    ))}
                                                </ul>
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
