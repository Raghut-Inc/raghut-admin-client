import { useState } from 'react';
import QuestionMetaInfo from './QuestionMetaInfo';
import { timeAgo } from '../../utils/timeAgo';
import ShortAnswerCard from './ShortAnswerCard';
import MCQCard from './MCQCard';

const UploadsCard = ({ q, qIndex, onDelete }) => {
    const [expanded, setExpanded] = useState({}); // { "qIndex-i": true }

    const toggleExpand = (key) => {
        setExpanded((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };



    return (
        <div key={qIndex} className="max-w-xl overflow-hidden shadow-sm bg-white w-full">
            <div className={`${(q.gptAnalyzed?.[0]?.questionText.includes("문제가 감지되지 않았습니다") || q.gptAnalyzed?.length === 0) ? "bg-red-500" : "bg-indigo-500"} text-white text-xs font-medium px-3 py-1.5 flex justify-between`}>
                <span>{(q.numberOfQuestions === 0) ? "문제 인식 안됨" : `${q.numberOfQuestions} 문제 인식됨`}</span>
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
                            <div key={i} className="bg-gray-50 p-3 relative">
                                <p className='text-gray-500 font-medium'>[{item?.questionType}]</p>
                                {(item?.questionType === "ShortAnswer")
                                    ? <ShortAnswerCard questionItem={item} isOpen={isOpen} toggleExpand={toggleExpand} expandKey={key} />
                                    : <MCQCard questionItem={item} isOpen={isOpen} toggleExpand={toggleExpand} expandKey={key} />
                                }
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default UploadsCard;
