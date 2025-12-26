import { renderMixedMath } from "../../utils/latexUtils";

const CardMathShortAnswer = ({ questionItem }) => {
    const hasError = !!questionItem?.error;
    const invalidReason = questionItem?.invalidReason

    return (
        <div className="flex-1 rounded-lg bg-white border border-gray-200 shadow-sm overflow-hidden">
            {/* Question Header */}
            <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                <div className="gap-2 text-xs flex flex-col items-start">
                    <div className="flex space-x-1 items-center">
                        {!hasError && questionItem?.isQuestionValid === false && (
                            <span className="inline-flex shrink-0 items-center rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-600 border border-red-200">
                                Invalid
                            </span>
                        )}
                        <span className="mt-0.5 inline-flex shrink-0 items-center rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
                            SA
                        </span>
                    </div>

                    <div className="font-semibold text-gray-800 line-clamp-1">
                        {questionItem.questionNumber}.{" "}
                        {renderMixedMath(questionItem.questionText)}
                    </div>
                </div>
            </div>

            {/* Invalid Reason */}
            {!hasError && questionItem?.isQuestionValid === false && invalidReason && (
                <div className="mx-2 mt-3 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2">
                    <p className="text-[11px] font-semibold text-orange-700">
                        문제 무효 사유 <span className="text-orange-500/70">(Invalid Reason)</span>
                    </p>
                    <p className="mt-1 text-[11px] text-orange-800/90 whitespace-pre-line">
                        {renderMixedMath(invalidReason)}
                    </p>
                </div>
            )}

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
                        {renderMixedMath(questionItem.solutionSummary)}
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
                                            {renderMixedMath(`${step.stepNumber}. ${step.stepTitle}`)}
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
        </div>
    );
};

export default CardMathShortAnswer;
