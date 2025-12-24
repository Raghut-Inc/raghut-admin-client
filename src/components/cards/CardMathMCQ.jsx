// CardMathMCQ.jsx
import { renderMixedMath } from "../../utils/latexUtils";

const CardMathMCQ = ({ questionItem }) => {
    const qn = questionItem?.questionNumber ?? "-";
    const qt = (questionItem?.questionType ?? "mcq").toString();
    const hasError = !!questionItem?.error;
    const invalidReason = questionItem?.invalidReason

    const correctSet = new Set(
        (questionItem?.correctChoices ?? [])
            .map((c) => c?.choiceLabel)
            .filter(Boolean)
    );

    return (
        <div className="w-full rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="gap-2 text-xs flex flex-col items-start">
                    <div className="flex space-x-1 items-center">
                        {!hasError && questionItem?.isQuestionValid === false && (
                            <span className="inline-flex shrink-0 items-center rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-600 border border-orange-200">
                                Invalid
                            </span>
                        )}
                        <span className="mt-0.5 inline-flex shrink-0 items-center rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
                            {String(qt).toUpperCase()}
                        </span>
                    </div>


                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-gray-800 line-clamp-2">
                                <span className="mr-1 text-gray-400">{qn}.</span>
                                {renderMixedMath(questionItem?.questionText)}
                            </p>
                        </div>
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
                        {invalidReason}
                    </p>
                </div>
            )}

            {/* Choices */}
            <div className="px-4 py-3">
                <ul className="space-y-1">
                    {(questionItem?.choices ?? []).map((choice, i) => {
                        const label = choice?.choiceLabel ?? "";
                        const isCorrect = correctSet.has(label);

                        return (
                            <li
                                key={i}
                                className={`flex gap-2 rounded-lg px-2 py-1.5 text-[11px] leading-relaxed border ${isCorrect
                                    ? "bg-green-50 border-green-200"
                                    : "bg-white border-gray-200"
                                    }`}
                            >
                                <span
                                    className={`shrink-0 font-semibold ${isCorrect ? "text-green-700" : "text-gray-500"
                                        }`}
                                >
                                    {label}.
                                </span>

                                <span className={isCorrect ? "text-green-800 font-semibold" : "text-gray-700"}>
                                    {renderMixedMath(choice?.choiceText)}
                                </span>
                            </li>
                        );
                    })}
                </ul>
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
            {!hasError && (
                <div className="px-4 py-4 border-t border-gray-200 text-xs space-y-4">
                    {/* Solution Steps */}
                    {questionItem?.solutionSteps?.length > 0 && (
                        <div>
                            <p className="mb-2 text-[11px] font-semibold text-gray-700">
                                풀이 단계 <span className="text-gray-400">(Solution Steps)</span>
                            </p>

                            <div className="space-y-2">
                                {questionItem.solutionSteps.map((step) => (
                                    <div key={step.stepNumber} className="rounded-lg bg-gray-50 p-3">
                                        <p className="text-[11px] font-semibold text-gray-800">
                                            {step.stepNumber}. {step.stepTitle}
                                        </p>
                                        <p className="mt-1 text-[11px] leading-relaxed text-gray-700 whitespace-pre-line">
                                            {renderMixedMath(step.stepExplanation)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Error */}
            {hasError && (
                <div className="m-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-xs">
                    <p className="text-[11px] font-semibold text-yellow-800">⚠ 오류</p>
                    <p className="mt-1 text-[11px] text-yellow-800/90 whitespace-pre-line">
                        {questionItem.error}
                    </p>
                </div>
            )}
        </div>
    );
};

export default CardMathMCQ;
