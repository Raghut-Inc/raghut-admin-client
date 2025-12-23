import { renderMixedMath } from "../../utils/latexUtils";

const CardMathShortAnswer = ({ questionItem }) => {
    return (
        <div className="flex-1 rounded-lg bg-white border border-gray-200 shadow-sm overflow-hidden">
            {/* Question Header */}
            <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                <div className="gap-2 text-xs flex flex-col items-start">
                    <span className="mt-0.5 inline-flex shrink-0 items-center rounded-full bg-gray-200 px-2 py-0.5 text-[9px] font-semibold text-gray-600">
                        {questionItem.questionType.toUpperCase()}
                    </span>
                    <div className="font-semibold text-gray-800 line-clamp-1">
                        {questionItem.questionNumber}.{" "}
                        {renderMixedMath(questionItem.questionText)}
                    </div>
                </div>
            </div>

            {/* Answer */}
            <div className="px-3 py-2">
                {questionItem.expectedAnswer?.map((ans, idx) => (
                    <div
                        key={idx}
                        className="inline-block px-2 py-1 rounded-md bg-green-50 text-green-700 font-semibold text-sm"
                    >
                        {renderMixedMath(ans.answer)}
                    </div>
                ))}
            </div>

            {!questionItem.error && (
                <div className="px-3 py-3 border-t border-gray-200 text-xs space-y-3">
                    <p className="font-semibold text-gray-700 mb-2">
                        풀이 요약
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                        {questionItem.solutionSummary}
                    </p>
                </div>
            )}
            
            {/* Expanded Content */}
            {!questionItem.error && (
                <div className="px-3 py-3 border-t border-gray-200 text-xs space-y-3">
                    {/* Solution Steps */}
                    {questionItem.solutionSteps?.length > 0 && (
                        <div>
                            <p className="font-semibold text-gray-700 mb-2">
                                풀이 단계
                            </p>

                            <div className="space-y-2">
                                {questionItem.solutionSteps.map((step) => (
                                    <div
                                        key={step.stepNumber}
                                        className="rounded-md bg-gray-50 px-2 py-2"
                                    >
                                        <p className="font-semibold text-gray-800 mb-1">
                                            {step.stepNumber}. {step.stepTitle}
                                        </p>
                                        <p className="text-gray-700 leading-relaxed">
                                            {renderMixedMath(step.stepExplanation)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reason */}
                    {questionItem.expectedAnswer?.map(
                        (ans, idx) =>
                            ans.reason && (
                                <div key={idx} className="text-gray-500">
                                    <span className="font-medium">이유:</span>{" "}
                                    {renderMixedMath(ans.reason)}
                                </div>
                            )
                    )}
                </div>
            )}

            {/* Error */}
            {questionItem.error && (
                <div className="m-3 rounded-md border border-yellow-300 bg-yellow-50 p-3 text-xs">
                    <p className="font-semibold text-yellow-700 mb-1">⚠ 오류</p>
                    <p className="text-yellow-800">{questionItem.error}</p>
                </div>
            )}
        </div>
    );
};

export default CardMathShortAnswer;
