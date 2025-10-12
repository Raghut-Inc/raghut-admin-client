import { renderMixedMath } from "../../utils/latexUtils";

const CardEngShortAnswer = ({ questionItem, isOpen }) => {
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
            </div>

            {isOpen && !questionItem.error && (
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

            {isOpen && questionItem.error && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-md p-3 mt-1">
                    <p className="font-semibold text-yellow-700">ERROR</p>
                    <p>{questionItem.error}</p>
                </div>
            )}
        </div>
    );
};

export default CardEngShortAnswer;
