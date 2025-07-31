import { useState } from "react";
import QuestionMetaInfo from "./QuestionMetaInfo";
import { timeAgo } from "../../utils/timeAgo";

const ShortAnswerCard = ({ q, qIndex, onDelete, questionType }) => {
    const [expanded, setExpanded] = useState({}); // track expand per question item

    const toggleExpand = (key) => {
        setExpanded((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    return (
        <div key={qIndex} className="max-w-xl overflow-hidden shadow-sm bg-white w-full">
            <div
                className={`${(q.gptAnalyzed?.[0]?.questionText.includes("문제가 감지되지 않았습니다") ||
                    q.gptAnalyzed?.length === 0)
                    ? "bg-red-500"
                    : "bg-indigo-500"
                    } text-white text-xs font-medium px-3 py-1.5 flex justify-between`}
            >
                <span>
                    {(q.gptAnalyzed?.[0]?.questionText.includes("문제가 감지되지 않았습니다") ||
                        q.gptAnalyzed?.length === 0)
                        ? "문제 인식 안됨"
                        : `${q.gptAnalyzed?.length || 0} 문제 인식됨`}
                </span>
                {q.processingTimeMs && <span>{(q.processingTimeMs / 1000).toFixed(1)}초</span>}
                <span>
                    {timeAgo(q.createdAt)} (
                    {new Date(q.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}
                    )
                </span>
            </div>

            <div className="flex flex-col w-full bg-gray-800 p-3 text-white text-xs space-y-3">
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

                                    {item.expectedAnswer?.map((ans, idx) => (
                                        <div key={idx} className="">
                                            <p>
                                                <strong className="text-green-600">{ans.answer}</strong> {" "}
                                                <span className="text-gray-600">({ans.answerInKorean})</span>
                                            </p>
                                        </div>
                                    ))}

                                    <button
                                        className="text-indigo-700 underline absolute bottom-0 right-0 text-xs"
                                        onClick={() => toggleExpand(key)}
                                    >
                                        {isOpen ? "접기 ▲" : "더보기 ▼"}
                                    </button>


                                </div>
                                {isOpen && (
                                    <p className="mt-3 text-xs whitespace-pre-line border-t border-gray-300 pt-2">

                                        {item.expectedAnswer?.map((ans, idx) => (
                                            <div key={idx} className="mb-2">
                                                {ans.reason && <p className="text-xs text-gray-500">이유: {ans.reason}</p>}
                                                {ans.sourceText && <p className="text-xs text-gray-500">출처: {ans.sourceText}</p>}
                                            </div>
                                        ))}
                                        {item.explanation}
                                    </p>
                                )}
                            </div>

                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ShortAnswerCard;
