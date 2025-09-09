import { renderMixedMath } from "../../utils/latexUtils";

const CardMathShortAnswer = ({ questionItem, isOpen}) => {
    return (
        <div className="flex-1 text-xs text-black rounded overflow-hidden">
            <div className="relative w-full h-full">
                <div className="text-xs">
                    <div className="flex gap-1">
                        <span className="text-gray-400">[{questionItem.questionType}]</span>
                        <span className="font-semibold line-clamp-1">
                            {questionItem.questionNumber}. {renderMixedMath(questionItem.questionText)}
                        </span>
                    </div>

                    <div className="mt-1 space-y-1">
                        {questionItem.expectedAnswer?.map((ans, idx) => (
                            <p key={idx} className="font-semibold text-green-600 leading-tight">
                                {renderMixedMath(ans.answer)}
                            </p>
                        ))}
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="mt-3 text-xs whitespace-pre-line border-t border-gray-300 pt-2">
                    <div>
                        <p className="font-semibold mb-1">풀이 단계 (Solution Steps):</p>
                        {questionItem.solutionSteps?.map((step) => (
                            <div key={step.stepNumber} className="mb-3 whitespace-pre-line">
                                <p className="font-semibold">
                                    {step.stepNumber}. {step.stepTitle}
                                </p>
                                <p>{renderMixedMath(step.stepExplanation)}</p>
                            </div>
                        ))}
                    </div>

                    {questionItem.expectedAnswer?.map((ans, idx) => (
                        <div key={idx} className="mb-2">
                            {ans.reason && (
                                <p className="text-xs text-gray-500">
                                    이유: {renderMixedMath(ans.reason)}
                                </p>
                            )}
                        </div>
                    ))}

                    {!questionItem.isQuestionValid && (
                        <div className="bg-yellow-50 border border-yellow-300 rounded-md p-3 mt-3">
                            <p className="font-semibold text-yellow-700">
                                문제 유효성 오류 (Invalid Question)
                            </p>
                            <p>이유: {questionItem.invalidReason}</p>
                            <p>제안된 수정: {questionItem.suggestedFix}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CardMathShortAnswer;
