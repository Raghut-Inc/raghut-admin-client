import { useState } from "react";
import QuestionMetaInfo from "./QuestionMetaInfo";
import { timeAgo } from "../../utils/timeAgo";
import CardEngShortAnswer from "./CardEngShortAnswer";
import CardEngMCQ from "./CardEngMCQ";
import CardMathMCQ from "./CardMathMCQ";
import CardMathShortAnswer from "./CardMathShortAnswer";

const UploadCard = ({ q, qIndex, onDelete, setFilter }) => {
    const [expanded, setExpanded] = useState({}); // { "qIndex-i": true }

    const toggleExpand = (key) => {
        setExpanded((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const renderQuestionCard = (item, key) => {
        const isOpen = expanded[key];
        // Use q.subject to pick card type
        if (q.subject === "math") {
            // Render math cards here
            if (item.questionType === "ShortAnswer") {
                return (
                    <CardMathShortAnswer
                        key={key}
                        questionItem={item}
                        isOpen={isOpen}
                        toggleExpand={toggleExpand}
                        expandKey={key}
                    />
                );
            } else {
                return (
                    <CardMathMCQ
                        key={key}
                        questionItem={item}
                        isOpen={isOpen}
                        toggleExpand={toggleExpand}
                        expandKey={key}
                    />
                );
            }
        } else {
            // Default to English cards (or other subjects)
            if (item.questionType === "ShortAnswer") {
                return (
                    <CardEngShortAnswer
                        key={key}
                        questionItem={item}
                        isOpen={isOpen}
                        toggleExpand={toggleExpand}
                        expandKey={key}
                    />
                );
            } else {
                return (
                    <CardEngMCQ
                        key={key}
                        questionItem={item}
                        isOpen={isOpen}
                        toggleExpand={toggleExpand}
                        expandKey={key}
                    />
                );
            }
        }
    };

    return (
        <div key={qIndex} className="max-w-xl overflow-hidden shadow-sm bg-white w-full">
            <div
                className={`${q.gptAnalyzed?.[0]?.questionText.includes("문제가 감지되지 않았습니다") ||
                    q.gptAnalyzed?.length === 0
                    ? "bg-red-500"
                    : "bg-indigo-500"
                    } text-white text-xs font-medium px-3 py-1 flex justify-between items-center`}
            >
                <div className="flex space-x-1.5 items-center">
                    <div className={`${q.subject === "math" ? "text-pink-500" : "text-indigo-500"} bg-white px-2 rounded text-xs`}>{q.subject}</div>
                    <span>·</span>
                    <span>{`${q.numberOfQuestions === 0 ? "문제 인식 안됨" : `${q.numberOfQuestions} 문제`} · ${(q.processingTimeMs / 1000).toFixed(1)}초`}</span>
                </div>
                <span>
                    {timeAgo(q.createdAt)} (
                    {new Date(q.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}
                    )
                </span>
            </div>

            <div className="flex flex-col w-full bg-gray-800 p-3 text-white text-xs space-y-3">
                {/* Image preview */}
                <QuestionMetaInfo q={q} onDelete={onDelete} timeAgo={timeAgo} setFilter={setFilter} />

                <div className="flex-1 text-xs text-black rounded overflow-hidden">
                    {q.status === "processing" ? (
                        <div className="flex justify-center bg-gray-50 items-center p-4">
                            {/* You can customize the loader here */}
                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-r-2 border-indigo-500"></span>
                            <span className="ml-2 text-indigo-500 italic">Processing...</span>
                        </div>
                    ) : (
                        q.gptAnalyzed?.map((item, i) => {
                            const key = `${qIndex}-${i}`;
                            return <div key={key} className="bg-gray-50 p-3 relative">{renderQuestionCard(item, key)}</div>;
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default UploadCard;
