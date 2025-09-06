import { renderMixedMath } from "../../utils/latexUtils";

const CardEngShortAnswer = ({ questionItem, isOpen, toggleExpand, expandKey }) => {
    return (
        <div className="flex-1 text-xs text-black rounded overflow-hidden">
            <div className='relative w-full h-full'>
                <div className="flex gap-1">
                    <span className="text-gray-400">[{questionItem.questionType}]</span>
                    <span className="font-semibold line-clamp-1">
                        {questionItem.questionNumber}. {renderMixedMath(questionItem.questionText)}
                    </span>
                </div>

                <div className="mt-1 space-y-1">
                    {questionItem.expectedAnswer?.map((ans, idx) => (
                        <p key={idx} className="leading-tight">
                            <span className="font-semibold text-green-600">
                                {renderMixedMath(ans.answer)}
                            </span>
                        </p>
                    ))}
                </div>
                <button
                    className="text-indigo-700 underline absolute bottom-0 right-0 text-xs bg-white px-2 py-1 rounded-lg"
                    onClick={() => toggleExpand(expandKey)}
                >
                    {isOpen ? "접기 ▲" : "더보기 ▼"}
                </button>
            </div>

            {isOpen && (
                <div className="mt-3 text-xs whitespace-pre-line border-t border-gray-300 pt-2">
                    {questionItem.expectedAnswer?.map((ans, idx) => (
                        <div key={idx} className="mb-2">
                            {ans.reason && <p className="text-xs text-gray-500">이유: {renderMixedMath(ans.reason)}</p>}
                            {ans.sourceText && <p className="text-xs text-gray-500">출처: {renderMixedMath(ans.sourceText)}</p>}
                        </div>
                    ))}
                    {renderMixedMath(questionItem.explanation)}
                </div>
            )}
        </div>
    );
};

export default CardEngShortAnswer;
